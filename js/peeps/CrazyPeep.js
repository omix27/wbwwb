Game.addToManifest({

	hangry: "sprites/peeps/hangry.json",

    scream: "sounds/scream.mp3"

});

/****

FRAMES:
00-09: walk loop
10-20: shout (14-19 as 2ndary loop)

****/

function CrazyPeep(scene){

	var self = this;
    self.type = "square"
	Peep.apply(self, [scene]);
    self._CLASS_ = "CrazyPeep";

	// MAD SPRITE
    var g = self.graphics;
    self.bodyMC = self.addMovieClip("hangry");
    self.bodyMC.anchor.x = 0.33; // not quite

    // STARTING POS & DIRECTION
    self.x = 1200;
    self.y = 330;
    self.direction = Math.PI;
    self.loop = false;

    // GRACE PERIODS FOR YELLIN'
    self.metaGracePeriod = _s(BEAT*3.5);
    self.wanderGracePeriod = _s(2);
    self.gracePeriod = _s(4.5);

    // WANDERING
    self.wander = 0;
    self.changeWander = function(){
        self.wander = Math.random()*0.1-0.05;
    };
    self.callbacks.update = function(){

        // NOPE
        if(self.metaGracePeriod>0){
            self.metaGracePeriod--;
            if(self.metaGracePeriod==0){
                self.callbacks.startWalking();
            }
            return; // NO MORE.
        }

        // Grace Period
        if(self.gracePeriod>0){
            self.gracePeriod--;
        }
        if(self.wanderGracePeriod>0){
            self.wanderGracePeriod--;
        }

        // Animate on doubles
        doubles = (doubles+1)%2;

        // Wander around
        if(self.wanderGracePeriod<=0){
            self.direction += self.wander;
            if(Math.random()<0.05) self.changeWander();
        }

        // STAY WITHIN GAME FRAME
        if(self.wanderGracePeriod<=0){
            self.stayWithinRect({
                l:100, r:860, t:100, b:480
            },0.15);
        }

        // BUMP the walking peeps I'm close to.
        if(self.gracePeriod<=0){
            var closeTo = self.touchingPeeps(50, function(peep){
                return peep.isWalking;
            });
            if(closeTo.length>0 && self.isWalking){

                // STOP & SHOUT
                self.isWalking = false;
                self.bodyMC.gotoAndStop(10);
                loopScreaming = 2;
                self.direction += Math.PI;

                // AHHHHH
                Game.sounds.scream.play();

                // Grace Period
                self.gracePeriod = _s(1);

                // SHOCK 'EM
                closeTo.forEach(function(other){
                    if(!other.isWalking) return;

                    if (other._CLASS_ == "PanicPeep"){
                        self.weaponType = "bat";
                        closeTo[0].getKilledBy(self);
                    }else{
                        other.flip = -1*self.flip;
                        other.beShocked();
                        other.vel.x = self.flip*10;
                    }
                    if  (other._CLASS_ == "EvilHatPeep"){
                        self.weaponType = "bat";
                        closeTo[0].getKilledBy(self);
                    }
                });

            }
        }

    };
    self.callbacks.startWalking = function(){
        self.speed = 2;
    };
    self.speed = 0;

    // Animate on doubles
    var doubles = 0;
    var loopScreaming = -1;

    // WEIRD WALK
    self.walkAnim = function(){

        // Hop & flip
        self.hop += self.speed/50;
        if(self.hop>1) self.hop--;
        self.flip = (self.vel.x<0) ? -1 : 1;

        // Hop up & down
        var t = self.hop*Math.PI;
        g.pivot.y = Math.abs(Math.sin(t))*20;

        // FRAMES: MANUALLY
        if(doubles==0){
            var nextFrame = self.bodyMC.currentFrame+1;
            if(nextFrame>9) nextFrame=0;
            self.bodyMC.gotoAndStop(nextFrame);
        }

    };

    // SHOUT STANDING
    self.standAnim = function(){
        
        g.rotation = 0;
        g.pivot.y = 0;

        // FRAMES: MANUALLY
        if(doubles==0){
            var nextFrame = self.bodyMC.currentFrame+1;
            if(loopScreaming>0){
                if(nextFrame>19){
                    nextFrame=16;
                    loopScreaming--;
                }
            }else{
                if(nextFrame>20){
                    nextFrame=0;
                    self.isWalking = true;
                    loopScreaming--;
                }
            }
            self.bodyMC.gotoAndStop(nextFrame);
        }

    };
    self.shocked = false;
    self.beShocked = function(){
        
        self.shocked = true;
        self.stopWalking();
 

        self.setTimeout(function(){
            self.startWalking();
            self.shocked = false;
        },_s(2));

    }

    self.confused = false;
    self.beConfused = function(target){

        self.flip = (target.x>self.x) ? 1 : -1;
        self._CLASS_ = "NormalPeep";
        self.confused = true;
        self.stopWalking();
        self.bounce = 1.1;


        self.setTimeout(function(){

            self.startWalking();
            self.confused = false;
            self._CLASS_ = "CrazyPeep";

        },_s(2.2));
    }
    // IS SCREAMING?
    self.isScreaming = function(){
        return(loopScreaming>=0);
    };

    //he will die
    self.getKilledBy = function(killer){

        var CORPSE_FRAME, CORPSE_VELOCITY, GORE_AMOUNT;
        switch(killer.weaponType){
            case "gun":
                CORPSE_FRAME = 0;
                CORPSE_VELOCITY = 2;
                GORE_AMOUNT = 5;
                break;
            case "bat":
                CORPSE_FRAME = 1;
                CORPSE_VELOCITY = 5;
                GORE_AMOUNT = 15;
                break;
            case "shotgun":
                CORPSE_FRAME = 2;
                CORPSE_VELOCITY = 10;
                GORE_AMOUNT = 30;
                break;
            case "axe":
                CORPSE_FRAME = 3;
                CORPSE_VELOCITY = 5;
                GORE_AMOUNT = 15;
                break;
        }

        // SCREEN SHAKE
        scene.shaker.shake(30);

        // MY CORPSE
        var flip = (killer.x<self.x) ? -1 : 1;
        var frameOffset = (self.type=="circle") ? 0 : 1;
        var deadbody = new DeadBody(scene);
        deadbody.init({
            direction: -Math.TAU/4 - flip*0.7,
            velocity: CORPSE_VELOCITY,
            x: self.x,
            y: self.y,
            flip: flip,
            frame: 0
        });
        scene.world.addProp(deadbody);    

        // MY GORE
        for(var i=0;i<GORE_AMOUNT;i++){
            var gore = new Gore(scene);
            gore.init({
                direction: -Math.TAU/4 - flip*Math.random()*0.5,
                velocity: CORPSE_VELOCITY+Math.random()*7,
                x: self.x,
                y: self.y,
                z: (Math.random()*-30)
            });
            scene.world.addProp(gore);
        }

        // KILL
        self.kill();

    };
}