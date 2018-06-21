// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

window.ROTATION_VELOCITY = 50;
window.ROTATION_ACCELERATION = 150;

window.SCR_Player = cc.Class({
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

    onLoad() {
        this.rb = this.node.getComponent(cc.RigidBody);
        this.rb.fixedRotation = true;
        this.rb.gravityScale = 0;
    },

    update(dt) {
		if (g_scrGameplay.state == State.PLAY) {
			this.rb.angularVelocity += dt * ROTATION_ACCELERATION;
			
			var damping = 1000;
			
			if (this.node.rotation < -30) {
				this.rb.angularVelocity += dt * damping;
			}
			
			if (this.node.rotation > 15) {
				this.node.rotation = 15;
			}
		}
		
        if (this.node.y < -SCREEN_HEIGHT * 0.5) {
            g_scrGameplay.gameOver();
        }
    },

    enableGravity() {
        this.rb.gravityScale = 1;
    },

    fly() {
        this.rb.linearVelocity = cc.v2(0, 1000);
		this.rb.angularVelocity = -ROTATION_VELOCITY;
    },

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.body.type != cc.RigidBodyType.Static) {
            g_scrGameplay.gameOver();
        }
    }
});

