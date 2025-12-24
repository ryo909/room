import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.load.setBaseURL(import.meta.env.BASE_URL);

        // Tiles
        this.load.image('tile_floor_32', 'assets/studyroom_pixel32/tile_floor_32.png');
        this.load.image('tile_rug_32', 'assets/studyroom_pixel32/tile_rug_32.png');

        this.load.image('tile_wall_top', 'assets/studyroom_pixel32/tile_wall_top.png');
        this.load.image('tile_wall_bottom', 'assets/studyroom_pixel32/tile_wall_bottom.png');
        this.load.image('tile_wall_left', 'assets/studyroom_pixel32/tile_wall_left.png');
        this.load.image('tile_wall_right', 'assets/studyroom_pixel32/tile_wall_right.png');
        this.load.image('tile_wall_corner_tl', 'assets/studyroom_pixel32/tile_wall_corner_tl.png');
        this.load.image('tile_wall_corner_tr', 'assets/studyroom_pixel32/tile_wall_corner_tr.png');
        this.load.image('tile_wall_corner_bl', 'assets/studyroom_pixel32/tile_wall_corner_bl.png');
        this.load.image('tile_wall_corner_br', 'assets/studyroom_pixel32/tile_wall_corner_br.png');

        // Common shadow
        this.load.image('shadow_oval_big', 'assets/studyroom_pixel32/shadow_oval_big.png');

        // Avatar
        this.load.image('avatar_idle', 'assets/studyroom_pixel32/avatar_idle.png');

        // Objects
        this.load.image('obj_timer_station', 'assets/studyroom_pixel32/obj_timer_station.png');
        this.load.image('obj_task_board', 'assets/studyroom_pixel32/obj_task_board.png');
        this.load.image('obj_settings_door', 'assets/studyroom_pixel32/obj_settings_door.png');
        this.load.image('obj_trophy_shelf', 'assets/studyroom_pixel32/obj_trophy_shelf.png');
        this.load.image('obj_music_station', 'assets/studyroom_pixel32/obj_music_station.png');

        this.load.image('obj_plant_stage0', 'assets/studyroom_pixel32/obj_plant_stage0.png');
        this.load.image('obj_plant_stage1', 'assets/studyroom_pixel32/obj_plant_stage1.png');
        this.load.image('obj_plant_stage2', 'assets/studyroom_pixel32/obj_plant_stage2.png');
        this.load.image('obj_plant_stage3', 'assets/studyroom_pixel32/obj_plant_stage3.png');

        // UI
        this.load.image('ui_panel_bg', 'assets/studyroom_pixel32/ui_panel_bg.png');
        this.load.image('ui_button_pill', 'assets/studyroom_pixel32/ui_button_pill.png');
        this.load.image('ui_focus_outline', 'assets/studyroom_pixel32/ui_focus_outline.png');

        // Icons
        this.load.image('icon_tomato', 'assets/studyroom_pixel32/icon_tomato.png');
        this.load.image('icon_check', 'assets/studyroom_pixel32/icon_check.png');
        this.load.image('icon_gear', 'assets/studyroom_pixel32/icon_gear.png');
        this.load.image('icon_trophy', 'assets/studyroom_pixel32/icon_trophy.png');
        this.load.image('icon_music', 'assets/studyroom_pixel32/icon_music.png');
    }

    create() {
        this.scene.start('MainScene');
        this.scene.start('UIScene'); // Overlay UI
    }
}
