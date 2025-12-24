import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.load.setBaseURL(import.meta.env.BASE_URL);

        // Background / FX
        this.load.image('bg_floor', 'assets/desk_assets_b_flat/bg_floor.png');
        this.load.image('bg_frame', 'assets/desk_assets_b_flat/bg_frame.png');
        this.load.image('fx_vignette', 'assets/desk_assets_b_flat/fx_vignette.png');
        this.load.image('fx_noise', 'assets/desk_assets_b_flat/fx_noise.png');

        // Common shadow
        this.load.image('shadow_oval', 'assets/desk_assets_b_flat/shadow_oval.png');

        // Objects
        this.load.image('obj_desk', 'assets/desk_assets_b_flat/obj_desk.png');
        this.load.image('obj_letterstand', 'assets/desk_assets_b_flat/obj_letterstand.png');
        this.load.image('obj_hourglass', 'assets/desk_assets_b_flat/obj_hourglass.png');
        this.load.image('obj_sofa', 'assets/desk_assets_b_flat/obj_sofa.png');
        this.load.image('obj_window', 'assets/desk_assets_b_flat/obj_window.png');
        this.load.image('obj_door', 'assets/desk_assets_b_flat/obj_door.png');
        this.load.image('obj_plant_stage0', 'assets/desk_assets_b_flat/obj_plant_stage0.png');
        this.load.image('obj_plant_stage1', 'assets/desk_assets_b_flat/obj_plant_stage1.png');
        this.load.image('obj_plant_stage2', 'assets/desk_assets_b_flat/obj_plant_stage2.png');
        this.load.image('obj_plant_stage3', 'assets/desk_assets_b_flat/obj_plant_stage3.png');

        // Avatar
        this.load.image('avatar_idle', 'assets/desk_assets_b_flat/avatar_idle.png');

        // UI
        this.load.image('ui_button_pill', 'assets/desk_assets_b_flat/ui_button_pill.png');
        this.load.image('ui_panel_bg', 'assets/desk_assets_b_flat/ui_panel_bg.png');
        this.load.image('ui_focus_outline', 'assets/desk_assets_b_flat/ui_focus_outline.png');
    }

    create() {
        this.scene.start('MainScene');
        this.scene.start('UIScene'); // Overlay UI
    }
}
