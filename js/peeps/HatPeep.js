Game.addToManifest({
    hatguy: "sprites/peeps/hatguy.json"
});

/****

JUST WADDLE BACK & FORTH

****/

function HatPeep(scene){

	var self = this;
    self.type ="circle"
	Peep.apply(self, [scene]);
    self._CLASS_ = "HatPeep";

	// Add the body & face sprites
    self.bodyMC = self.addMovieClip("hatguy");
    self.bodyMC.gotoAndStop(0);

    self.callbacks.update = function(){

        // stay within game frame
        self.stayWithinRect({
            l:100, r:860, t:100, b:480
        },0.05);

    };
    self.frown = function(){
        self.stopWalking();
    };
    self.panic = function(){
        self.callbacks.startWalking = function(){
            self.speed = 3+Math.random()*2;
        };
        self.loop = false;
        self.startWalking();
    }

    self.callbacks.update = function(){
        if(self.y<-500){
              self.kill();
         }
    }
    // WEIRD WALK
    self.walkAnim = function(){

        // Hop & flip
        self.hop += self.speed/40;
        if(self.hop>1) self.hop--;
        self.flip = (self.vel.x<0) ? -1 : 1;

        // Hop up & down
        var t = self.hop*Math.TAU;
        var g = self.graphics;
        g.rotation = Math.sin(t)*0.2;
        g.pivot.y = Math.abs(Math.sin(t))*7;

    };

    self.offended = false;
    self.beOffended = function(target){

        self.flip = (target.x>self.x) ? 1 : -1;
        self.offended = true;
        self.stopWalking();

        self.clearAnims(); // just in case...

        // Blink
        self.bounce = 1.2;

        // Walk away
        self.setTimeout(function(){
            self.startWalking();
            self.offended = false;
        },_s(3));

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

}