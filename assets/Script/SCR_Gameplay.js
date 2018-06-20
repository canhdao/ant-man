window.SCREEN_WIDTH = 0;
window.SCREEN_HEIGHT = 0;

window.LAYER_BACKGROUND = 0;
window.LAYER_OBSTACLE_MIDDLE = 1;
window.LAYER_OBSTACLE = 2;
window.LAYER_GROUND = 3;
window.LAYER_PLAYER = 4;
window.LAYER_UI = 5;

var State = cc.Enum({
	MENU:   0,
    READY:  1,
    PLAY:   2,
    FINISH: 3 
});

window.State = State;

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

        playerAntFake: {
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

        playerWaspFake: {
            default: null,
            type: cc.Node
        },

        playerWaspTrails: {
            default: [],
            type: cc.Node
        }
    },

    // use this for initialization
    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0, -3000);
        cc.director.getCollisionManager().enabled = true;

        SCREEN_WIDTH = this.node.width;
        SCREEN_HEIGHT = this.node.height;

        var self = this;

        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.onTouchStart(event);
        }, this.node);

        this.OBSTACLE_DISTANCE = SCREEN_WIDTH * 0.8;
        this.OBSTACLE_SPACE = SCREEN_WIDTH * 0.5;

        this.obstacles = [];

        window.g_scrGameplay= this;

        this.score = 0;
        this.best = cc.sys.localStorage.getItem("best");
        if (this.best == null) this.best = 0;
    },

    start() {
        this.lblGameOver.active = false;
		this.lblScore.active = false;
        this.lblResultScore.active = false;
        this.lblResultBest.active = false;
		
		this.ready.active = false;
		this.hand.active = false;

        this.generateObstacles();

		this.ground1.zIndex = LAYER_GROUND;
		this.ground2.zIndex = LAYER_GROUND;

        this.lblScore.zIndex = LAYER_UI;
        this.uiResult.zIndex = LAYER_UI;
        this.uiResult.active = true;

        this.player = this.playerAnt;
        this.playerFake = this.playerAntFake;
        this.playerTrails = this.playerAntTrails;

        this.player.zIndex = LAYER_PLAYER;
        this.player.scale = cc.v2(1, 1);

        this.playerFake.zIndex = LAYER_PLAYER;
        this.playerFake.scale = cc.v2(1, 1);

        this.player.x = SCREEN_WIDTH;
		
        for (var i = 0; i < this.playerAntTrails.length; i++) {
            this.playerAntTrails[i].active = false;
        }

        for (var i = 0; i < this.playerWaspTrails.length; i++) {
            this.playerWaspTrails[i].active = false;
        }

        this.scalingPlayer = false;

        this.replay.active = false;

        this.state = State.MENU;
    },

    // called every frame
    update(dt) {
        if (this.obstacleTop.x < this.SPAWN_X - this.OBSTACLE_DISTANCE) {
            this.generateObstacles();

            this.obstacleTop.getComponent(SCR_Obstacle).move();
            this.obstacleBottom.getComponent(SCR_Obstacle).move();
            this.obstacleMiddle.getComponent(SCR_Obstacle).move();
        }

        if (this.scalingPlayer) {
            for (var i = 0; i < this.playerTrails.length; i++) {
                if (this.playerTrails[i] != null) {
                    if (this.playerFake.scaleX <= this.playerTrails[i].scaleX) {
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

    onTouchStart(event) {
		if (this.state == State.READY) {
			this.ready.active = false;
			this.hand.active = false;
			this.lblScore.active = true;
			
			this.obstacleTop.getComponent(SCR_Obstacle).move();
			this.obstacleBottom.getComponent(SCR_Obstacle).move();
			this.obstacleMiddle.getComponent(SCR_Obstacle).move();
			this.player.getComponent(SCR_Player).enableGravity();
			
			var move = cc.moveTo(1, -SCREEN_WIDTH * 0.5 + SCREEN_WIDTH * 0.33, this.player.y).easing(cc.easeSineOut());
			this.player.runAction(move);			
			
			this.state = State.PLAY;
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
		
		var self = this;
        var activateRealPlayer = function() {
            self.playerFake.destroy();
            self.player.scale = self.playerFake.scale;
            self.player.x = 0;
        };

        var scale = cc.scaleTo(0.75, 0.5, 0.5).easing(cc.easeElasticOut(0.3));
        var sequence = cc.sequence(scale, cc.callFunc(activateRealPlayer));
		this.playerFake.runAction(sequence);

        this.scalingPlayer = true;
		
		this.state = State.READY;
	},

    onReplay() {
        cc.director.loadScene("SCN_Gameplay");
    },

    onChangeCharacter() {
        if (this.player == this.playerAnt) {
            this.player = this.playerWasp;
            this.playerFake = this.playerWaspFake;
            this.playerTrails = this.playerWaspTrails;

            this.playerAntFake.x = -1080;
            this.playerWaspFake.x = 0;
        }
        else {
            this.player = this.playerAnt;
            this.playerFake = this.playerAntFake;
            this.playerTrails = this.playerAntTrails;

            this.playerAntFake.x = 0;
            this.playerWaspFake.x = -1080;
        }
    },

    generateObstacles() {
        this.obstacleTop = cc.instantiate(this.PFB_OBSTACLE_TOP);
        this.obstacleBottom = cc.instantiate(this.PFB_OBSTACLE_BOTTOM);
        this.obstacleMiddle = cc.instantiate(this.PFB_OBSTACLE_MIDDLE);

        this.SPAWN_X = SCREEN_WIDTH * 0.5 + this.obstacleTop.width * 0.5 * this.obstacleTop.scaleX;

        var refY = Math.random() * SCREEN_HEIGHT * 0.5 - SCREEN_HEIGHT * 0.25;

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

    gameOver() {
        for (var i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i].getComponent(SCR_Obstacle).stop();
        }

        this.lblGameOver.active = true;
        this.lblScore.active = false;
        this.lblResultScore.active = true;
        this.lblResultBest.active = true;
        this.replay.active = true;

        this.lblResultScore.getComponent(cc.Label).string = "SCORE: " + this.score;
        this.lblResultBest.getComponent(cc.Label).string = "BEST: " + this.best;

        this.state = State.FINISH;
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

