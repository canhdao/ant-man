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

window.PlayerState = cc.Enum({
	BIG:       0,
	SMALL:     1,
    ENLARGING: 2,
    SHRINKING: 3
});

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
		this.state = PlayerState.BIG;
		this.bigCountDown = 0;

        var collider = this.node.getComponent(cc.PhysicsCircleCollider);
        this.colliderOffset = collider.offset;
        this.colliderRadius = collider.radius;
    },

    update(dt) {
		if (g_scrGameplay.state == State.PLAY) {
			if (this.state == PlayerState.SMALL) {
				this.rb.angularVelocity += dt * ROTATION_ACCELERATION;
				
				var damping = 1000;
				
				if (this.node.rotation < -30) {
					this.rb.angularVelocity += dt * damping;
				}
				
				if (this.node.rotation > 15) {
					this.node.rotation = 15;
				}
			}
			
			if (this.state == PlayerState.BIG) {
				if (this.bigCountDown > 0) {
					this.bigCountDown -= dt;
				}
				else {
					this.shrink();
				}
			}
		}
		
        if (this.node.x >= SCREEN_WIDTH * 0.5 + this.node.width * 0.5 * this.node.scaleX) {
            g_scrGameplay.gameOver();
        }

        if (this.collidedNode != null) {
            this.collidedNode.linked1.x = this.collidedNode.x;
            this.collidedNode.linked2.x = this.collidedNode.x;
        }
    },

    enableGravity() {
        this.rb.gravityScale = 1;
    },

    fly() {
        this.rb.linearVelocity = cc.v2(0, 1000);
		this.rb.angularVelocity = -ROTATION_VELOCITY;
    },
	
	enlarge() {
        this.bigCountDown = POWER_UP_DURATION;

		var scale = cc.scaleTo(0.75, 1.0, 1.0).easing(cc.easeElasticOut(0.3));
		this.state = PlayerState.ENLARGING;

        var setBig = cc.callFunc(this.setBig, this);
        var sequence = cc.sequence(scale, setBig);

        this.node.runAction(sequence);
	},
	
	shrink() {
        var scale = cc.scaleTo(0.75, 0.5, 0.5).easing(cc.easeElasticOut(0.3));
		this.state = PlayerState.SHRINKING;
		
        var setSmall = cc.callFunc(this.setSmall, this);
        var addPhysics = cc.callFunc(this.addPhysics, this);
        var sequence = null;

		if (this.node.getComponent(cc.RigidBody) == null) {
			sequence = cc.sequence(scale, addPhysics, setSmall);
		}
		else {
            sequence = cc.sequence(scale, setSmall);
		}

        this.node.runAction(sequence);
	},

    setBig() {
        this.state = PlayerState.BIG;
    },

    setSmall() {
        this.state = PlayerState.SMALL;
    },
	
	addPhysics() {
		this.rb = this.node.addComponent(cc.RigidBody);
		this.rb.type = cc.RigidBodyType.Dynamic;
		this.rb.enabledContactListener = true;

		var collider = this.node.addComponent(cc.PhysicsCircleCollider);
        collider.offset = this.colliderOffset;
		collider.radius = this.colliderRadius;
	},

    generateFakeTop(top) {
        var b = top.y - top.height * top.scaleY * 0.5;
        var h = SCREEN_HEIGHT * 0.5 - b;
        var w = top.width * top.scaleX;

        if (h <= w) {
            var obstacle = cc.instantiate(g_scrGameplay.PFB_OBSTACLE_TOP_FAKE);
            obstacle.zIndex = LAYER_OBSTACLE;

            var sprite = obstacle.getComponent(cc.Sprite);
            sprite.fillRange = h / (obstacle.height * obstacle.scaleY);
            sprite.fillStart = 0;

            obstacle.parent = this.node.parent;
            obstacle.position = top.position;
        }
        else {
            var n = Math.ceil(h / w);
            for (var i = 0; i < n; i++) {
                var obstacle = cc.instantiate(g_scrGameplay.PFB_OBSTACLE_TOP_FAKE);
                obstacle.zIndex = LAYER_OBSTACLE;

                var sprite = obstacle.getComponent(cc.Sprite);
                sprite.fillRange = w / (obstacle.height * obstacle.scaleY);
                sprite.fillStart = i * w / (obstacle.height * obstacle.scaleY);

                obstacle.anchorY = sprite.fillStart + sprite.fillRange * 0.5;

                obstacle.parent = this.node.parent;
                obstacle.position = cc.v2(top.position.x, b + (i + 0.5) * w);
            }
        }
    },

    generateFakeBottom(bottom) {
        var t = bottom.y + bottom.height * bottom.scaleY * 0.5;
        var h = SCREEN_HEIGHT * 0.5 + t - g_scrGameplay.ground1.height * g_scrGameplay.ground1.scaleY;
        var w = bottom.width * bottom.scaleX;

        if (h <= w) {
            var obstacle = cc.instantiate(g_scrGameplay.PFB_OBSTACLE_BOTTOM_FAKE);
            obstacle.zIndex = LAYER_OBSTACLE;

            var sprite = obstacle.getComponent(cc.Sprite);
            sprite.fillRange = h / (obstacle.height * obstacle.scaleY);
            sprite.fillStart = 1 - sprite.fillRange;

            obstacle.parent = this.node.parent;
            obstacle.position = bottom.position;
        }
        else {
            var n = Math.ceil(h / w);
            for (var i = 0; i < n; i++) {
                var obstacle = cc.instantiate(g_scrGameplay.PFB_OBSTACLE_BOTTOM_FAKE);
                obstacle.zIndex = LAYER_OBSTACLE;

                var sprite = obstacle.getComponent(cc.Sprite);
                sprite.fillRange = w / (obstacle.height * obstacle.scaleY);
                sprite.fillStart = 1 - sprite.fillRange - i * w / (obstacle.height * obstacle.scaleY);

                obstacle.anchorY = sprite.fillStart + sprite.fillRange * 0.5;

                obstacle.parent = this.node.parent;
                obstacle.position = cc.v2(bottom.position.x, t - (i + 0.5) * w);
            }
        }
    },

    generateFakeMiddle(middle) {
        var top = middle.linked1;
        var t = top.y - top.height * top.scaleY * 0.5;

        var bottom = middle.linked2;
        var b = bottom.y + bottom.height * bottom.scaleY * 0.5;

        var h = t - b;
        var w = middle.width * middle.scaleX;

        if (h <= w) {
            var obstacle = cc.instantiate(g_scrGameplay.PFB_OBSTACLE_MIDDLE_FAKE);
            obstacle.zIndex = LAYER_OBSTACLE_MIDDLE;

            var sprite = obstacle.getComponent(cc.Sprite);
            sprite.fillRange = h / (obstacle.height * obstacle.scaleY);
            sprite.fillStart = (1 - sprite.fillRange) * 0.5;

            obstacle.parent = this.node.parent;
            obstacle.position = middle.position;
        }
        else {
            var n = Math.ceil(h / w);
            for (var i = 0; i < n; i++) {
                var obstacle = cc.instantiate(g_scrGameplay.PFB_OBSTACLE_MIDDLE_FAKE);
                obstacle.zIndex = LAYER_OBSTACLE_MIDDLE;

                var sprite = obstacle.getComponent(cc.Sprite);
                sprite.fillRange = w / (obstacle.height * obstacle.scaleY);
                var totalFillRange = sprite.fillRange * n;
                sprite.fillStart = i * w / (obstacle.height * obstacle.scaleY) + (1 - totalFillRange) * 0.5;

                obstacle.anchorY = sprite.fillStart + sprite.fillRange * 0.5;

                obstacle.parent = this.node.parent;
                var totalHeight = w * n;
                obstacle.position = cc.v2(middle.position.x, middle.position.y + i * w - totalHeight * 0.5);
            }
        }
    },
	
	onCollisionEnter(otherCollider, selfCollider) {
        if (g_scrGameplay.state == State.PLAY) {
			if (otherCollider.node.name == "PowerUp") {
				otherCollider.node.destroy();
				
				if (this.state == PlayerState.SMALL) {
					this.enlarge();
					
					this.node.getComponent(SCR_Player).rb.linearVelocity = cc.v2(0, 0);
					this.node.getComponent(SCR_Player).rb.angularVelocity = 0;
					this.node.rotation = 0;
					
                    this.node.getComponent(cc.PhysicsCircleCollider).destroy();
					this.node.getComponent(cc.RigidBody).destroy();

                    g_scrGameplay.moveFast();
				}
			}

            if (this.state == PlayerState.BIG || this.state == PlayerState.ENLARGING) {
                if (otherCollider.node.name == "top" || otherCollider.node.name == "bottom") {
                    otherCollider.node.getComponent(cc.Sprite).enabled = false;
                    otherCollider.node.linked1.getComponent(cc.Sprite).enabled = false;

                    if (otherCollider.node.name == "top") {
                        this.generateFakeTop(otherCollider.node);
                        this.generateFakeMiddle(otherCollider.node.linked1);
                    }

                    if (otherCollider.node.name == "bottom") {
                        this.generateFakeBottom(otherCollider.node);
                        this.generateFakeMiddle(otherCollider.node.linked1);
                    }
                }
            }
		}
	},

    onBeginContact(contact, selfCollider, otherCollider) {
		if (this.state == PlayerState.SMALL) {
			if (g_scrGameplay.state == State.PLAY) {
				if (otherCollider.node.name == "top" || otherCollider.node.name == "bottom"
					|| otherCollider.node.name == "Ground1" || otherCollider.node.name == "Ground2") {
					g_scrGameplay.stopMoving();
				}

				if (otherCollider.node.name == "top" || otherCollider.node.name == "bottom") {
					this.collidedNode = otherCollider.node;

					var scale1 = cc.scaleTo(0.05, 0.95, 0.95).easing(cc.easeSineInOut(0.05));
					var scale2 = cc.scaleTo(0.1, 1.025, 1.025).easing(cc.easeSineInOut(0.1));
					var scale3 = cc.scaleTo(0.05, 1, 1).easing(cc.easeSineInOut(0.05));
					var sequence = cc.sequence(scale1, scale2, scale3);

					otherCollider.node.getComponent(cc.PhysicsBoxCollider).destroy();
					otherCollider.node.getComponent(cc.RigidBody).destroy();
					otherCollider.node.runAction(sequence);

					cc.audioEngine.play(g_scrGameplay.sndImpactWall);
					this.sndFallingID = cc.audioEngine.play(g_scrGameplay.sndFalling);
				}
			}

			if (g_scrGameplay.state == State.PLAY || g_scrGameplay.state == State.FALL) {
				if (otherCollider.node.name == "Ground1" || otherCollider.node.name == "Ground2") {
					if (this.sndFallingID != null) cc.audioEngine.stop(this.sndFallingID);
					cc.audioEngine.play(g_scrGameplay.sndImpactLand);
				}
			}
		}
    },

    onPostSolve(contact, selfCollider, otherCollider) {
		if (this.state == PlayerState.SMALL) {
			if (otherCollider.body.type != cc.RigidBodyType.Static) {
				this.rb.linearVelocity = cc.v2(500, 1000);
				this.rb.angularVelocity = ROTATION_VELOCITY * 2;
			}
		}
    }
});

