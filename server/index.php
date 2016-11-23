<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="grid.css">
    <script src="src/an.core.loop.js"></script>
    <script src="http://jslib.loc/linker.js"></script>
    <style>
        #canvas {
            margin: 0 auto;
            /*border: 3px #515151 solid;*/
        }
    </style>
</head>
<body>
<div id="counter"></div>
<canvas id="canvas"></canvas>

<div>
    <button class="linker" data-id="def" data-action="def-head">def-head</button>
    <button class="linker" data-id="def" data-action="def-middle">def-middle</button>
    <button class="linker" data-id="def" data-action="def-bottom">def-bottom</button>
</div>

<div>
    <button class="linker" data-id="attack" data-action="attack-head">attack-head</button>
    <button class="linker" data-id="attack" data-action="attack-middle">attack-middle</button>
    <button class="linker" data-id="attack" data-action="attack-bottom">attack-bottom</button>
</div>

<script>

    var elemCounter = document.getElementById('counter');

    var animate = new Loop({
        selector: '#canvas',
        width: 300,
        height: 300,
        fps: 30,
        loop: Loop.LOOP_ANIMATE
    });

    // force, power, strength, intensity, might, energy
    var hero = {
        health_point: 100,
        strength: 10,
        hit: 80
    };

    var enemy = {
        health_point: 100,
        strength: 10,
        hit: 80
    };

    Linker.search();
    Linker.click("def", function(event){
        console.log(event.target.getAttribute('data-action'));
    });
    Linker.click("attack", function(event){
        console.log(event.target.getAttribute('data-action'));
    });

    /* */
     animate.frame('main', {
        x: 0,
        y: 0,
        runner: function (ctx, frameCounter) {

            //ctx.fillRect(this.x, 50, 50, 50);

//            elemCounter.textContent = frameCounter + ' frame';
//            ctx.fillRect(this.x, 50, 50, 50);
//            if (this.x < loop.width) this.x += 5;
//            else {
//                this.x = 0;
//                animate.stop();
//                setTimeout(function(){
//                    animate.play('main');
//                },1000);
//            }

        }
    });

    animate.render('main');

</script>
</body>
</html>