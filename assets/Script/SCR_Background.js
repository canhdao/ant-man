// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
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
    },

    // LIFE-CYCLE CALLBACKS:

    update (dt) {
        if (g_scrGameplay.state != State.FINISH) {
            if (g_scrGameplay.moveSpeed == MoveSpeed.ZERO) {
                this.node.x -= BACKGROUND_MOVE_SPEED * dt;
            }

            if (g_scrGameplay.moveSpeed == MoveSpeed.NORMAL) {
                this.node.x -= BACKGROUND_MOVE_SPEED * BACKGROUND_NORMAL_MULTIPLIER * dt;
            }

            if (g_scrGameplay.moveSpeed == MoveSpeed.FAST) {
                this.node.x -= BACKGROUND_MOVE_SPEED * BACKGROUND_FAST_MULTIPLIER * dt;
            }

            if (g_scrGameplay.moveSpeed == MoveSpeed.VERY_FAST) {
                this.node.x -= BACKGROUND_MOVE_SPEED * BACKGROUND_VERY_FAST_MULTIPLIER * dt;
            }

            if (this.node.x <= -this.node.width) {
                this.node.x += this.node.width * 2;
            }
        }
    },
});
