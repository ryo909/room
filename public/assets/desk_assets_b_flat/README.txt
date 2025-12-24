# Desk Assets (B: flat + subtle texture)
This pack is designed to replace debug rectangles with a "classic study" look.
All PNGs are offline-friendly and can be bundled in your repo's /assets folder.

Suggested keys:
- bg_floor.png             (tileable floor texture, 256x256)
- bg_frame.png             (frame overlay for 1024x768)
- fx_vignette.png          (vignette overlay, 1024x768)
- fx_noise.png             (subtle noise overlay, 1024x768)
- shadow_oval.png           (soft shadow blob)
- obj_desk.png
- obj_letterstand.png
- obj_hourglass.png
- obj_sofa.png
- obj_plant_stage0.png ... obj_plant_stage3.png
- obj_window.png
- obj_door.png
- avatar_idle.png
- ui_button_pill.png
- ui_panel_bg.png
- ui_focus_outline.png

Notes:
- If your canvas size differs from 1024x768, you can scale the overlays.
- For best results: draw order should be
  floor -> object shadows -> objects -> focus outline -> UI -> vignette/noise
