// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var ObstaclePosition = cc.Enum({
    TOP:    0,
	MIDDLE: 1,
    BOTTOM: 2
});

window.SCR_Obstacle = cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },

        position: {
            default: ObstaclePosition.TOP,
            type: ObstaclePosition
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.rb = this.node.getComponent(cc.RigidBody);
        this.passedPlayer = false;
    },

    update(dt) {
        // score
        if (this.position == ObstaclePosition.TOP && !this.passedPlayer && this.node.x < g_scrGameplay.player.x) {
            g_scrGameplay.increaseScore();
            this.passedPlayer = true;
        }

        // out of screen
        if (this.node.x < -SCREEN_WIDTH * 0.5 - this.node.width * 0.5 * this.node.scaleX - g_scrGameplay.OBSTACLE_DISTANCE) {
            this.node.destroy();
            var index = g_scrGameplay.obstacles.indexOf(this.node);
            g_scrGameplay.obstacles.splice(index, 1);
        }
    },

    move() {
        this.rb.linearVelocity = cc.v2(-OBSTACLE_MOVE_SPEED, 0);
    },

    stop() {
        this.rb.linearVelocity = cc.v2(0, 0);
    }
});
