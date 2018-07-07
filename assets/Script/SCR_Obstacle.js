// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

window.ObstaclePosition = cc.Enum({
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
		
		PFB_POWER_UP: {
			default: null,
			type: cc.Prefab
		},

        PFB_POWER_UP_TRUCK_ANT: {
            default: null,
            type: cc.Prefab
        },

        PFB_POWER_UP_FLY_ANT: {
            default: null,
            type: cc.Prefab
        },

        PFB_POWER_UP_TRUCK_WASP: {
            default: null,
            type: cc.Prefab
        },

        PFB_POWER_UP_FLY_WASP: {
            default: null,
            type: cc.Prefab
        },

        position: {
            default: ObstaclePosition.TOP,
            type: ObstaclePosition
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.rb = this.node.getComponent(cc.RigidBody);
        this.passedPlayer = false;
		
		// power up
		if (this.position == ObstaclePosition.MIDDLE && g_scrGameplay.player.getComponent(SCR_Player).state == PlayerState.SMALL) {
            var r = Math.random();

            if (r < 0.5) {
                r = Math.random();
                if (r < POWER_UP_RATE) {
                    this.spawnPowerUpBig();
                }
            }
            else {
                r = Math.random();
                if (r < POWER_UP_TRUCK_RATE) {
                    this.spawnPowerUpTruck();
                }
            }
		}
	},

    update(dt) {
        // score
        if (this.position == ObstaclePosition.BOTTOM && !this.passedPlayer && this.node.x < g_scrGameplay.player.x) {
            g_scrGameplay.increaseScore();
            this.passedPlayer = true;
        }

        // out of screen
        if (this.node.x < -SCREEN_WIDTH * 0.5 - this.node.width * 0.5 * this.node.scaleX - g_scrGameplay.OBSTACLE_DISTANCE) {
			this.clean();
        }
    },

    move() {
        if (g_scrGameplay.moveSpeed == MoveSpeed.NORMAL) {
            this.rb.linearVelocity = cc.v2(-OBSTACLE_MOVE_SPEED, 0);
        }

        if (g_scrGameplay.moveSpeed == MoveSpeed.FAST) {
            this.rb.linearVelocity = cc.v2(-OBSTACLE_MOVE_SPEED * OBSTACLE_FAST_MULTIPLIER, 0);
        }

        if (g_scrGameplay.moveSpeed == MoveSpeed.VERY_FAST) {
            this.rb.linearVelocity = cc.v2(-OBSTACLE_MOVE_SPEED * OBSTACLE_VERY_FAST_MULTIPLIER , 0);
        }
    },

    stop() {
        this.rb.linearVelocity = cc.v2(0, 0);
    },
	
	clean() {
		this.node.destroy();
		var index = g_scrGameplay.obstacles.indexOf(this.node);
		g_scrGameplay.obstacles.splice(index, 1);
        if (g_scrGameplay.obstacleBottom == this.node) {
            g_scrGameplay.obstacleBottom = null;
        }
	},

    spawnPowerUpBig() {
        var powerUp = cc.instantiate(this.PFB_POWER_UP);
        powerUp.position = cc.v2(0, 0);
        powerUp.parent = this.node;
        this.powerUp = powerUp;
    },

    spawnPowerUpTruck() {
        var powerUpTruck = null;

        if (g_scrGameplay.player == g_scrGameplay.playerAnt) {
            powerUpTruck = cc.instantiate(this.PFB_POWER_UP_TRUCK_ANT);
        }
        else {
            powerUpTruck = cc.instantiate(this.PFB_POWER_UP_TRUCK_WASP);
        }

        powerUpTruck.position = cc.v2(0, 0);
        powerUpTruck.parent = this.node;
        this.powerUpTruck = powerUpTruck;
    },

    spawnPowerUpFly() {
        var powerUpFly = null;

        if (g_scrGameplay.player == g_scrGameplay.playerTruckAnt) {
            powerUpFly = cc.instantiate(this.PFB_POWER_UP_FLY_ANT);
        }
        else {
            powerUpFly = cc.instantiate(this.PFB_POWER_UP_FLY_WASP);
        }

        powerUpFly.position = cc.v2(0, this.node.height * 0.5 + 150);
        powerUpFly.parent = this.node;
        this.powerUpFly = powerUpFly;
    }
});
