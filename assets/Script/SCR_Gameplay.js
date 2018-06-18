window.SCREEN_WIDTH = 0;
window.SCREEN_HEIGHT = 0;

var State = cc.Enum({
    READY:  0,
    PLAY:   1,
    FINISH: 2 
});

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

        lblTapToPlay: {
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

        this.OBSTACLE_DISTANCE = SCREEN_WIDTH * 0.5;
        this.OBSTACLE_SPACE = SCREEN_WIDTH * 0.8;

        this.obstacles = [];

        window.g_scrGameplay= this;

        this.lblScore.zIndex = 1;
        this.lblGameOver.zIndex = 1;
        this.lblResultScore.zIndex = 1;
        this.lblResultBest.zIndex = 1;

        this.score = 0;
        this.best = cc.sys.localStorage.getItem("best");
        if (this.best == null) this.best = 0;
    },

    start() {
        this.lblTapToPlay.y = -SCREEN_HEIGHT * 0.25;

        this.lblGameOver.active = false;
        this.lblGameOver.y = SCREEN_HEIGHT * 0.25;

        this.lblScore.y = SCREEN_HEIGHT * 0.25;

        this.lblResultScore.active = false;
        this.lblResultScore.y = SCREEN_HEIGHT * 0.15;

        this.lblResultBest.active = false;
        this.lblResultBest.y = SCREEN_HEIGHT * 0.05;

        this.generateObstacles();

        this.state = State.READY;
    },

    // called every frame
    update(dt) {
        if (this.obstacleTop.x < this.SPAWN_X - this.OBSTACLE_DISTANCE) {
            this.generateObstacles();

            this.obstacleTop.getComponent(SCR_Obstacle).move();
            this.obstacleBottom.getComponent(SCR_Obstacle).move();
        }
    },

    onTouchStart(event) {
        if (this.state == State.READY) {
            this.lblTapToPlay.active = false;
            this.obstacleTop.getComponent(SCR_Obstacle).move();
            this.obstacleBottom.getComponent(SCR_Obstacle).move();
            g_scrPlayer.enableGravity();

            this.state = State.PLAY;
        }

        if (this.state == State.PLAY) {
            g_scrPlayer.fly();
        }

        if (this.state == State.FINISH) {
            cc.director.loadScene("SCN_Gameplay");
        }
    },

    generateObstacles() {
        this.obstacleTop = cc.instantiate(this.PFB_OBSTACLE_TOP);
        this.obstacleBottom = cc.instantiate(this.PFB_OBSTACLE_BOTTOM);

        this.SPAWN_X = SCREEN_WIDTH * 0.5 + this.obstacleTop.width * 0.5 * this.obstacleTop.scaleX;

        var refY = Math.random() * SCREEN_HEIGHT * 0.5 - SCREEN_HEIGHT * 0.25;

        this.obstacleTop.parent = this.node;
        this.obstacleTop.x = this.SPAWN_X;
        this.obstacleTop.y = refY + this.OBSTACLE_SPACE * 0.5 + this.obstacleTop.height * this.obstacleTop.scaleY * 0.5;

        this.obstacleBottom.parent = this.node;
        this.obstacleBottom.x = this.SPAWN_X;
        this.obstacleBottom.y = refY - this.OBSTACLE_SPACE * 0.5 - this.obstacleBottom.height * this.obstacleBottom.scaleY * 0.5;

        this.obstacles.push(this.obstacleTop);
        this.obstacles.push(this.obstacleBottom);
    },

    gameOver() {
        for (var i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i].getComponent(SCR_Obstacle).stop();
        }

        this.lblGameOver.active = true;
        this.lblScore.active = false;
        this.lblResultScore.active = true;
        this.lblResultBest.active = true;

        this.lblResultScore.getComponent(cc.Label).string = "Score: " + this.score;
        this.lblResultBest.getComponent(cc.Label).string = "Best: " + this.best;

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

