import bpy
import sys
import json
from math import radians, tan
from pathlib import Path

# Invocation:
#   blender --background 3d-pipeline/scripts/render_blender.py -- <slug> <work_dir> <output_dir>
args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(args) < 3:
    raise SystemExit("Usage: blender --background render_blender.py -- <slug> <work_dir> <output_dir>")

slug, work_dir, output_dir = args[0], Path(args[1]), Path(args[2])
generated_dir = work_dir / slug / "generated"
glbs = sorted(generated_dir.glob("*.glb"))
if not glbs:
    raise SystemExit(f"Aucun .glb pour {slug} dans {generated_dir}")
glb = glbs[0]

fov = None
meta_path = generated_dir / "model_metadata.json"
if meta_path.exists():
    meta = json.loads(meta_path.read_text())
    fov = meta.get("fov")
if not fov:
    fov = radians(35)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete()

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE_NEXT"
scene.render.samples = 32
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.film_transparent = True
scene.render.resolution_x = 512
scene.render.resolution_y = 512
scene.render.film_transparent = True

bpy.ops.import_scene.gltf(filepath=str(glb))
bpy.ops.object.select_all(action="DESELECT")
for obj in bpy.context.scene.objects:
    if obj.type == "MESH":
        obj.select_set(True)
bpy.context.view_layer.objects.active = bpy.context.selected_objects[0]
bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")

bpy.ops.object.join()
model = bpy.context.object
model.name = "model"

for mat in bpy.data.materials:
    if mat.use_nodes:
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Roughness"].default_value = 0.6

bbox = model.dimensions
center = model.location
max_dim = max(bbox)
distance = (max_dim / 2) / tan(fov / 2) * 1.4

camera_data = bpy.data.cameras.new("Cam")
camera_data.angle = fov
camera = bpy.data.objects.new("Cam", camera_data)
scene.collection.objects.link(camera)
scene.camera = camera

angle_vec = (1.0, -1.0, 0.75)
camera.location = center + (
    angle_vec[0] * distance,
    angle_vec[1] * distance,
    angle_vec[2] * distance * 0.9,
)

cam_look = (center[0], center[1], center[2] + max_dim * 0.05)
direction = (
    cam_look[0] - camera.location[0],
    cam_look[1] - camera.location[1],
    cam_look[2] - camera.location[2],
)
rotation = direction
camera.rotation_euler = (0, 0, 0)
bpy.ops.object.select_all(action="DESELECT")
camera.select_set(True)
bpy.context.view_layer.objects.active = camera
track = camera.constraints.new(type="TRACK_TO")
track.target = None
empty = bpy.data.objects.new("LookAt", None)
empty.location = cam_look
scene.collection.objects.link(empty)
track.target = empty
track.track_axis = "TRACK_NEG_Z"
track.up_axis = "UP_Y"

light_data = bpy.data.lights.new("Key", type="SUN")
light_data.energy = 3.0
light = bpy.data.objects.new("Key", light_data)
scene.collection.objects.link(light)
light.rotation_euler = (radians(45), 0, radians(-30))

fill_data = bpy.data.lights.new("Fill", type="AREA")
fill_data.energy = 120.0
fill = bpy.data.objects.new("Fill", fill_data)
scene.collection.objects.link(fill)
fill.location = center + (distance * 0.8, -distance * 0.4, distance * 0.3)

output_dir = Path(output_dir)
output_dir.mkdir(parents=True, exist_ok=True)
scene.render.filepath = str(output_dir / f"{slug}_v1.png")
bpy.ops.render.render(write_still=True)
print(f"Rendu OK: {scene.render.filepath}")
