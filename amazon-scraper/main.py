import asyncio
import logging
from typing import Optional, List, Any

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator
from fastapi.responses import JSONResponse

from scraper import fetch_product_async, search_amazon_async, ScrapeError, Product

# 1. Configuration du Logging pour la robustesse en production
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("amazon_scraper_api")

app = FastAPI(
    title="Amazon Product Scraper API",
    description="Récupère titre, images HD, description et infos de base d'un produit Amazon. Utilise Oxylabs avec fallback scraping direct.",
    version="2.0.1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# 2. Modèles Pydantic pour la validation stricte (Pydantic v2)
class ProductResponse(BaseModel):
    asin: str
    url: str
    title: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[str] = None
    currency: Optional[str] = None
    rating: Optional[str] = None
    reviews_count: Optional[str] = None
    availability: Optional[str] = None
    description: Optional[str] = None
    bullet_points: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    main_image: Optional[str] = None


class ScrapeQuery(BaseModel):
    url: Optional[str] = Field(None, description="URL complète du produit Amazon")
    asin: Optional[str] = Field(None, description="ASIN du produit (ex: B0CX23V2ZK)")
    domain: str = Field("fr", description="Domaine Amazon: fr, com, de, co.uk")
    proxy: Optional[str] = Field(None, description="Proxy à utiliser")
    use_oxylabs: bool = Field(True, description="Utiliser Oxylabs en priorité")

    @model_validator(mode='after')
    def verify_target_exists(self) -> 'ScrapeQuery':
        if not self.url and not self.asin:
            raise ValueError("Tu dois fournir soit 'url' soit 'asin'.")
        return self


class BatchRequest(BaseModel):
    queries: List[ScrapeQuery] = Field(
        ..., 
        max_length=50, 
        description="Liste des requêtes (maximum 50 pour éviter la surcharge)"
    )


class BatchResultItem(BaseModel):
    target: str
    error: Optional[str] = None
    result: Optional[ProductResponse] = None


class BatchResponse(BaseModel):
    results: List[BatchResultItem]


# 3. Gestionnaire d'exceptions global pour capturer les erreurs imprévues
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erreur globale non gérée: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Une erreur interne inattendue s'est produite."},
    )


@app.get("/", tags=["meta"])
def root():
    return {
        "status": "ok",
        "message": "Amazon Scraper API — voir /docs pour la documentation interactive.",
    }


@app.get("/scrape", response_model=ProductResponse, tags=["scraping"])
async def scrape(
    url: Optional[str] = Query(None, description="URL complète du produit Amazon"),
    asin: Optional[str] = Query(None, description="ASIN du produit (ex: B0CX23V2ZK)"),
    domain: str = Query("fr", description="Domaine Amazon: fr, com, de, co.uk"),
    proxy: Optional[str] = Query(None, description="Proxy à utiliser"),
    use_oxylabs: bool = Query(True, description="Utiliser Oxylabs en priorité"),
):
    target = url or asin
    if not target:
        raise HTTPException(status_code=400, detail="Fournis soit 'url' soit 'asin' en paramètre.")

    logger.info(f"Requête de scraping unitaire reçue pour la cible: {target} (Domaine: {domain})")

    try:
        product: Product = await fetch_product_async(
            target, domain=domain, proxy=proxy, use_oxylabs=use_oxylabs
        )
    except ScrapeError as e:
        logger.warning(f"Erreur de scraping (ScrapeError) sur {target}: {e}")
        raise HTTPException(status_code=502, detail=str(e))
    except ValueError as e:
        logger.warning(f"Erreur de validation (ValueError) sur {target}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    if not product.title:
        logger.warning(f"Blocage potentiel (aucun titre trouvé) pour {target}")
        raise HTTPException(
            status_code=422,
            detail="Page récupérée mais aucun titre trouvé — blocage ou CAPTCHA probable.",
        )

    return product.to_dict()


@app.get("/search", tags=["search"])
async def search(
    q: str = Query(..., description="Terme de recherche (ex: 'HPE ProLiant DL380 Gen10')"),
    domain: str = Query("fr", description="Domaine Amazon: fr, com, de, co.uk"),
):
    logger.info(f"Recherche initiée pour: '{q}' sur le domaine {domain}")
    results = await search_amazon_async(q, domain=domain)
    
    if not results:
        raise HTTPException(status_code=404, detail="Aucun résultat trouvé")
        
    return {"results": results}


@app.post("/scrape/batch", response_model=BatchResponse, tags=["scraping"])
async def scrape_batch(request: BatchRequest):
    logger.info(f"Lancement d'un batch de {len(request.queries)} requêtes.")
    
    async def process_query(req: ScrapeQuery) -> dict:
        target = req.url or req.asin
        try:
            product = await fetch_product_async(
                target, 
                domain=req.domain, 
                proxy=req.proxy, 
                use_oxylabs=req.use_oxylabs
            )
            return {"target": target, "error": None, "result": product.to_dict()}
        except Exception as e:
            logger.error(f"Erreur lors du traitement batch pour {target}: {e}")
            return {"target": target, "error": str(e), "result": None}

    # 4. Traitement asynchrone simultané avec asyncio.gather
    tasks = [process_query(req) for req in request.queries]
    results = await asyncio.gather(*tasks)
    
    return {"results": results}