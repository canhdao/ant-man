window.SCREEN_WIDTH = 0;
window.SCREEN_HEIGHT = 0;

window.LAYER_BACKGROUND = 0;
window.LAYER_OBSTACLE_MIDDLE = 1;
window.LAYER_OBSTACLE = 2;
window.LAYER_GROUND = 3;
window.LAYER_PLAYER = 4;
window.LAYER_UI = 5;

window.State = cc.Enum({
	MENU:   0,
    READY:  1,
    PLAY:   2,
    FALL:   3,
    FINISH: 4
});

var initializedAdmob = false;

cc.Class({
    extends: cc.Component,

    properties: {
        PFB_OBSTACLE_TOP: {
            default: null,
            type: cc.Prefab
        },
		
		PFB_OBSTACLE_MIDDLE: {
			default: null,
			type: cc.Prefab
		},

        PFB_OBSTACLE_BOTTOM: {
            default: null,
            type: cc.Prefab
        },

        PFB_OBSTACLE_TOP_FAKE: {
            default: null,
            type: cc.Prefab
        },
        
        PFB_OBSTACLE_MIDDLE_FAKE: {
            default: null,
            type: cc.Prefab
        },

        PFB_OBSTACLE_BOTTOM_FAKE: {
            default: null,
            type: cc.Prefab
        },

        uiResult: {
            default: null,
            type: cc.Node
        },

        lblGameOver: {
            default: null,
            type: cc.Node
        },

        lblScore: {
            default: null,
            type: cc.Node
        },

        lblResultScore: {
            default: null,
            type: cc.Node
        },

        lblResultBest: {
            default: null,
            type: cc.Node
        },
		
		ground1: {
			default: null,
			type: cc.Node
		},
		
		ground2: {
			default: null,
			type: cc.Node
		},
		
		title: {
			default: null,
			type: cc.Node
		},
		
		play: {
			default: null,
			type: cc.Node
		},

        leftArrow: {
            default: null,
            type: cc.Node
        },

        rightArrow: {
            default: null,
            type: cc.Node
        },

        replay: {
            default: null,
            type: cc.Node
        },
		
		ready: {
			default: null,
			type: cc.Node
		},
		
		hand: {
			default: null,
			type: cc.Node
		},
		
		playerAnt: {
			default: null,
			type: cc.Node
		},
		
		playerAntTrails: {
			default: [],
			type: cc.Node
		},

        playerWasp: {
            default: null,
            type: cc.Node
        },

        playerWaspTrails: {
            default: [],
            type: cc.Node
        },

        playerTruckAnt: {
            default: null,
            type: cc.Node
        },
		
		sndFly: {
			default: null,
			url: cc.AudioClip
		},
		
		sndGameOver: {
			default: null,
			url: cc.AudioClip
		},
		
		sndGameplay: {
			default: null,
			url: cc.AudioClip
		},
		
		sndGameplay_iOS: {
			default: null,
			url: cc.AudioClip
		},
		
		sndMainMenu: {
			default: null,
			url: cc.AudioClip
		},
		
		sndMainMenu_iOS: {
			default: null,
			url: cc.AudioClip
		},
		
		sndNext: {
			default: null,
			url: cc.AudioClip
		},
		
		sndPowerUp: {
			default: null,
			url: cc.AudioClip
		},
		
		sndShrink: {
			default: null,
			url: cc.AudioClip
		},

        sndEnlarge: {
            default: null,
            url: cc.AudioClip
        },

        sndBigImpact: {
            default: null,
            url: cc.AudioClip
        },

        sndFalling: {
            default: null,
            url: cc.AudioClip
        },

        sndImpactWall: {
            default: null,
            url: cc.AudioClip
        },

        sndImpactLand: {
            default: null,
            url: cc.AudioClip
        }
    },

    // use this for initialization
    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0, -3000);
        cc.director.getCollisionManager().enabled = true;
		//cc.director.getCollisionManager().enabledDebugDraw = true;
		
        SCREEN_WIDTH = this.node.width;
        SCREEN_HEIGHT = this.node.height;

        var self = this;

        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.onTouchStart(event);
        }, this.node);

        this.OBSTACLE_DISTANCE = SCREEN_WIDTH * OBSTACLE_DISTANCE_K;
        this.OBSTACLE_SPACE = SCREEN_WIDTH * OBSTACLE_SPACE_K;

        this.obstacles = [];
		
        window.g_scrGameplay = this;

        this.score = 0;
        this.best = cc.sys.localStorage.getItem("best");
        if (this.best == null) this.best = 0;

        this.character = cc.sys.localStorage.getItem("character");
        if (this.character == null) this.character = "ant";
		
		if (cc.sys.isNative && ENABLE_ADMOB) {
			if (!initializedAdmob) {
				sdkbox.PluginAdMob.init();
                sdkbox.PluginAdMob.cache("gameover");
				initializedAdmob = true;
			}
		}
    },

    start() {
        this.lblGameOver.active = false;
		this.lblScore.active = false;
        this.lblResultScore.active = false;
        this.lblResultBest.active = false;
		
		this.ready.active = false;
		this.hand.active = false;

		this.ground1.zIndex = LAYER_GROUND;
		this.ground2.zIndex = LAYER_GROUND;

        this.lblScore.zIndex = LAYER_UI;
        this.uiResult.zIndex = LAYER_UI;
        this.uiResult.active = true;

        this.player = this.playerAnt;
        this.playerTrails = this.playerAntTrails;

        this.playerAnt.zIndex = LAYER_PLAYER;

        this.playerWasp.zIndex = LAYER_PLAYER;
		
        for (var i = 0; i < this.playerAntTrails.length; i++) {
            this.playerAntTrails[i].active = false;
        }

        for (var i = 0; i < this.playerWaspTrails.length; i++) {
            this.playerWaspTrails[i].active = false;
        }

        this.scalingPlayer = false;

        this.replay.active = false;

        this.movingFast = false;

        if (this.character == "wasp") {
            this.onChangeCharacter();
        }

        this.playerTruckAnt.zIndex = LAYER_PLAYER;
        this.playerTruckAnt.active = false;

        this.pendingGenerateObstacles = false;

        this.state = State.MENU;
		
		if (cc.sys.os == cc.sys.OS_IOS) {
			this.sndMainMenuID = cc.audioEngine.play(this.sndMainMenu_iOS, true);
		}
		else {
			this.sndMainMenuID = cc.audioEngine.play(this.sndMainMenu, true);
		}
    },

    // called every frame
    update(dt) {
        if (this.state == State.PLAY) {
            if (this.player.getComponent(SCR_Player).vehicle == VehicleType.FLY) {
                this.flyMode();
            }
            else {
                this.truckMode();
            }
        }

        if (this.scalingPlayer) {
            for (var i = 0; i < this.playerTrails.length; i++) {
                if (this.playerTrails[i] != null) {
                    if (this.player.scaleX <= this.playerTrails[i].scaleX) {
                        this.playerTrails[i].active = true;
                        this.playerTrails[i] = null;
                        if (i == this.playerTrails.length - 1) {
                            this.scalingPlayer = false;
                        }
                    }
                }
            }
        }
    },

    flyMode() {
        if (this.obstacleBottom != null) {
            if (this.obstacleBottom.x < this.SPAWN_X - this.OBSTACLE_DISTANCE && !this.pendingGenerateObstacles) {
                if (this.player.getComponent(SCR_Player).bigCountDown >= 1 || this.player.getComponent(SCR_Player).bigCountDown <= 0) {
                    this.generateObstacles();

                    if (this.movingFast) {
                        this.obstacleTop.getComponent(SCR_Obstacle).moveFast();
                        this.obstacleBottom.getComponent(SCR_Obstacle).moveFast();
                        this.obstacleMiddle.getComponent(SCR_Obstacle).moveFast();
                    }
                    else {
                        this.obstacleTop.getComponent(SCR_Obstacle).move();
                        this.obstacleBottom.getComponent(SCR_Obstacle).move();
                        this.obstacleMiddle.getComponent(SCR_Obstacle).move();
                    }
                }
                else {
                    this.pendingGenerateObstacles = true;
                }
            }
        }

        if (this.pendingGenerateObstacles && this.player.getComponent(SCR_Player).state == PlayerState.SMALL) {
            this.generateObstacles();

            this.obstacleTop.getComponent(SCR_Obstacle).move();
            this.obstacleBottom.getComponent(SCR_Obstacle).move();
            this.obstacleMiddle.getComponent(SCR_Obstacle).move();

            this.movingFast = false;

            this.pendingGenerateObstacles = false;
        }
    },

    truckMode() {
        if (this.obstacleBottom != null) {
            if (this.obstacleBottom.x < this.SPAWN_X - this.OBSTACLE_DISTANCE) {
                this.generateObstaclesTruckMode();
            }
        }
    },

    onTouchStart(event) {
		if (this.state == State.READY) {
			this.ready.active = false;
			this.hand.active = false;
			this.lblScore.active = true;
			
            this.generateObstacles();

			this.obstacleTop.getComponent(SCR_Obstacle).move();
			this.obstacleBottom.getComponent(SCR_Obstacle).move();
			this.obstacleMiddle.getComponent(SCR_Obstacle).move();
			this.player.getComponent(SCR_Player).enableGravity();
			
			var move = cc.moveTo(1, -SCREEN_WIDTH * 0.5 + SCREEN_WIDTH * 0.33, this.player.y).easing(cc.easeSineOut());
			this.player.runAction(move);			
			
			this.state = State.PLAY;
			cc.audioEngine.stop(this.sndMainMenuID);
			if (cc.sys.os == cc.sys.OS_IOS) {
				this.sndGameplayID = cc.audioEngine.play(this.sndGameplay_iOS, true);
			}
			else {
				this.sndGameplayID = cc.audioEngine.play(this.sndGameplay, true);
			}
		}
		
        if (this.state == State.PLAY) {
            this.player.getComponent(SCR_Player).fly();
        }
    },
	
	onPlay() {
		this.title.active = false;
		this.play.active = false;
        this.leftArrow.active = false;
        this.rightArrow.active = false;
		this.ready.active = true;
		this.hand.active = true;

		this.player.getComponent(SCR_Player).shrink();

        this.scalingPlayer = true;

        if (this.player == this.playerAnt) {
            this.playerWasp.destroy();
        }
        else {
            this.playerAnt.destroy();
        }
		
		this.state = State.READY;
	},

    onReplay() {
        cc.director.loadScene("SCN_Gameplay");
		if (cc.sys.isNative && ENABLE_ADMOB) {
			sdkbox.PluginAdMob.show("gameover");
		}
    },

    onChangeCharacter() {
        if (this.player == this.playerAnt) {
            this.player = this.playerWasp;
            this.playerTrails = this.playerWaspTrails;

            this.playerAnt.x = -1080;
            this.playerWasp.x = 0;

            this.character = "wasp";
        }
        else {
            this.player = this.playerAnt;
            this.playerTrails = this.playerAntTrails;

            this.playerAnt.x = 0;
            this.playerWasp.x = -1080;

            this.character = "ant";
        }

		cc.audioEngine.play(this.sndNext);
        cc.sys.localStorage.setItem("character", this.character);
    },

    changeVehicle() {
        if (this.player == this.playerAnt) {
            this.player = this.playerTruckAnt;
            this.playerTruckAnt.position = this.playerAnt.position;
            this.playerTruckAnt.getComponent(cc.RigidBody).linearVelocity = this.playerAnt.getComponent(cc.RigidBody).linearVelocity;
            this.playerTruckAnt.getComponent(cc.RigidBody).angularVelocity = this.playerAnt.getComponent(cc.RigidBody).angularVelocity;
            this.playerTruckAnt.getComponent(cc.RigidBody).gravityScale = 1;
            this.playerAnt.active = false;
            this.playerTruckAnt.active = true;
            this.playerTruckAnt.awake = true;
        }
        else if (this.player == this.playerTruckAnt) {
            this.player = this.playerAnt;
            this.playerTruckAnt.active = false;
            this.playerAnt.active = true;
            this.playerAnt.position = this.playerTruckAnt.position;
            this.playerAnt.getComponent(cc.RigidBody).linearVelocity = this.playerTruckAnt.getComponent(cc.RigidBody).linearVelocity;
            this.playerAnt.getComponent(cc.RigidBody).angularVelocity = this.playerTruckAnt.getComponent(cc.RigidBody).angularVelocity;
        }
    },

    generateObstacles() {
        this.obstacleTop = cc.instantiate(this.PFB_OBSTACLE_TOP);
        this.obstacleBottom = cc.instantiate(this.PFB_OBSTACLE_BOTTOM);
        this.obstacleMiddle = cc.instantiate(this.PFB_OBSTACLE_MIDDLE);

        this.obstacleTop.linked1 = this.obstacleMiddle;
        this.obstacleTop.linked2 = this.obstacleBottom;

        this.obstacleBottom.linked1 = this.obstacleMiddle;
        this.obstacleBottom.linked2 = this.obstacleTop;

        this.obstacleMiddle.linked1 = this.obstacleTop;
        this.obstacleMiddle.linked2 = this.obstacleBottom;

        this.SPAWN_X = SCREEN_WIDTH * 0.5 + this.obstacleBottom.width * 0.5 * this.obstacleBottom.scaleX;

        var refY = (Math.random() - 0.5) * (SCREEN_HEIGHT - this.ground1.height) * OBSTACLE_CENTER_RANDOM_RANGE + this.ground1.height * 0.5;

        this.obstacleTop.parent = this.node;
        this.obstacleTop.x = this.SPAWN_X;
        this.obstacleTop.y = refY + this.OBSTACLE_SPACE * 0.5 + this.obstacleTop.height * this.obstacleTop.scaleY * 0.5;
        this.obstacleTop.zIndex = LAYER_OBSTACLE;

        this.obstacleBottom.parent = this.node;
        this.obstacleBottom.x = this.SPAWN_X;
        this.obstacleBottom.y = refY - this.OBSTACLE_SPACE * 0.5 - this.obstacleBottom.height * this.obstacleBottom.scaleY * 0.5;
        this.obstacleBottom.zIndex = LAYER_OBSTACLE;

        this.obstacleMiddle.parent = this.node;
        this.obstacleMiddle.x = this.SPAWN_X;
        this.obstacleMiddle.y = refY;
        this.obstacleMiddle.zIndex = LAYER_OBSTACLE_MIDDLE;

        this.obstacles.push(this.obstacleTop);
        this.obstacles.push(this.obstacleBottom);
        this.obstacles.push(this.obstacleMiddle);
    },

    generateObstaclesTruckMode() {
        this.obstacleTop = null;
        this.obstacleMiddle = null;

        var r = Math.random() * 4;
        for (var i = 0; i < r; i++) {
            this.obstacleBottom = cc.instantiate(this.PFB_OBSTACLE_BOTTOM);

            this.SPAWN_X = SCREEN_WIDTH * 0.5 + this.obstacleBottom.width * 0.5 * this.obstacleBottom.scaleX;

            this.obstacleBottom.parent = this.node;
            this.obstacleBottom.x = this.SPAWN_X + i * this.obstacleBottom.width * this.obstacleBottom.scaleX;
            this.obstacleBottom.y = -SCREEN_HEIGHT * 0.5 + this.ground1.height + (i + 1) * TRUCK_OBSTACLE_HEIGHT - this.obstacleBottom.height * 0.5 * this.obstacleBottom.scaleY;
            this.obstacleBottom.zIndex = LAYER_OBSTACLE;

            this.obstacles.push(this.obstacleBottom);

            this.obstacleBottom.getComponent(SCR_Obstacle).move();

            if (i == 3) {
                this.obstacleBottom.getComponent(SCR_Obstacle).spawnPowerUpFly();
            }
        }
    },

    move() {
        for (var i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i].getComponent(SCR_Obstacle).move();
        }

        this.ground1.getComponent(SCR_Ground).move();
        this.ground2.getComponent(SCR_Ground).move();

        this.movingFast = false;
    },

    moveFast() {
        for (var i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i].getComponent(SCR_Obstacle).moveFast();
        }

        this.ground1.getComponent(SCR_Ground).moveFast();
        this.ground2.getComponent(SCR_Ground).moveFast();

        this.movingFast = true;
    },
	
    stopMoving() {
        for (var i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i].getComponent(SCR_Obstacle).stop();
            if (this.obstacles[i].getComponent(cc.PhysicsBoxCollider) != null) {
                this.obstacles[i].getComponent(cc.PhysicsBoxCollider).enabled = false;
            }
        }
		
        this.ground1.getComponent(SCR_Ground).stop();
        this.ground2.getComponent(SCR_Ground).stop();

        g_scrGameplay.state = State.FALL;

        cc.audioEngine.stop(this.sndGameplayID);
    },

    gameOver() {
        this.lblGameOver.active = true;
        this.lblScore.active = false;
        this.lblResultScore.active = true;
        this.lblResultBest.active = true;
        this.replay.active = true;

        this.lblResultScore.getComponent(cc.Label).string = this.score;
        this.lblResultBest.getComponent(cc.Label).string = this.best;

        this.state = State.FINISH;

        if (this.sndGameOverID == null) {
            this.sndGameOverID = cc.audioEngine.play(this.sndGameOver);
        }
    },

    increaseScore() {
        this.score++;
        this.lblScore.getComponent(cc.Label).string = this.score;

        if (this.score > this.best) {
            this.best = this.score;
            cc.sys.localStorage.setItem("best", this.best);
        }
    }
});

