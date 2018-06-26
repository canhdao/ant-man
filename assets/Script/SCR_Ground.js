// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

window.SCR_Ground = cc.Class({
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

    onLoad () {
        this.rb = this.node.getComponent(cc.RigidBody);
        this.rb.linearVelocity = cc.v2(-OBSTACLE_MOVE_SPEED, 0);
    },

    update (dt) {
        if (this.node.x <= -this.node.width) {
            this.node.x += this.node.width * 2;
        }
    },

    stop() {
        this.rb.linearVelocity = cc.v2(0, 0);
    },

    move() {
        this.rb.linearVelocity = cc.v2(-OBSTACLE_MOVE_SPEED, 0);
    },

    moveFast() {
        this.rb.linearVelocity = cc.v2(-OBSTACLE_MOVE_SPEED * POWER_UP_MOVE_SPEED_MULTIPLIER , 0);
    }
});
