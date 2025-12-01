Game.addToManifest({
    lovehat: "sprites/peeps/lovehat.json",
    lover_shirt: "sprites/peeps/lover_shirt.json"
});

/****

FRAMES for "face":
08: LUV
09: Embarrassed looking up
10: Embarrassed blink
11: Embarrassed look fwd

****/

function LoverH(scene){

	var self = this;
	NormalPeep.apply(self, [scene]);
    self._CLASS_ = "LoverH";

	// Add the body & face sprites
    self.faceMC.gotoAndStop(8);

    // Set Type: ALSO CHANGE SHIRT
    var _oldSetType = self.setType;
    self.type="circle"


    // STARTING POS
    self.x = -1000;
    self.y = 580;

    self.callbacks.beShocked = function(){
        self.faceMC.gotoAndStop(8);
    };
    // Follow?
    self.follows = null;
    self.follow = function(follow){
        self.follows = follow;
    };
    self.callbacks.update = function(){
         var closeTo = self.touchingPeeps(90, function(peep){
            return(peep.isWalking && peep.type=="circle");
        });
        if(closeTo.length>0 && self.isWalking){
            self.follow(closeTo[0])
            self.faceMC.gotoAndStop(8);
        }
        if(self.follows){

            var f = self.follows;
            var tx = f.x - Math.cos(f.direction)*20;
            var ty = f.y - Math.sin(f.direction)*20;

            // LOOP THEM BOUNDS
            var margin = 50;
            var dx = tx-self.x;
            while(dx>300){
                tx -= Game.width+margin*2;
                dx = tx-self.x;
            }
            while(dx<-300){
                tx += Game.width+margin*2;
                dx = tx-self.x;
            }
            var dy = ty-self.y;
            while(dy>300){
                ty -= Game.height+margin*2;
                dy = ty-self.y;
            }
            while(dy<-300){
                ty += Game.height+margin*2;
                dy = ty-self.y;
            }

            var direction = Math.atan2(dy,dx);
            self.direction = direction;
        }else{

            // stay within game frame
            /*self.stayWithinRect({
                l:100, r:860, t:100, b:480
            },0.05);*/

        }


    };
    self.callbacks.startWalking = function(){
        self.direction = 3.3; // a bit upwards from a full-left
        self.speed = 1.3;
    };
    var _pastWalkAnim = self.walkAnim;
    self.walkAnim = function(){
        if(self.follows) self.hop+=self.speed/120;
        _pastWalkAnim();
    };
    self.callbacks.startWalking();

    // STAHP. *THEN walk.*
    self.stopWalking();
    self.setTimeout(function(){
        self.startWalking();
    },_s(BEAT*4));

}