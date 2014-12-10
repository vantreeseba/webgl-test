window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function glProgram() {
    this.frameNum = 0;

    this.vertexShader =
        "precision mediump float;" +
        "attribute vec3 pos;" +
        "uniform float scale;" +
        "void main() {" +
        "   gl_Position = vec4(pos, scale);" +
        "}";

    this.fragmentShader =
        "precision mediump float;" +
        "uniform float scale;" +
        "void main() {" +
        "   gl_FragColor = vec4(.1, .1, .1, 1.0) * scale;" +
        "}";

    this.scale = 2.0;
}

glProgram.prototype.addshader = function (prog, type, source) {
    var _self = this,
        gl = _self.gl;

    var s = gl.createShader((type == 'vertex') ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);

    gl.shaderSource(s, source);
    gl.compileShader(s);

    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw "Could not compile " + type + " shader:\n\n" + gl.getShaderInfoLog(s);
    }

    gl.attachShader(prog, s);
};

glProgram.prototype.shaderProgram = function shaderProgram(vs, fs) {
    var _self = this,
        gl = _self.gl,
        prog = gl.createProgram();

    _self.addshader(prog, 'vertex', vs);
    _self.addshader(prog, 'fragment', fs);

    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw "Could not link the shader program!";
    }

    return prog;
};

glProgram.prototype.attributeSetFloats = function attributeSetFloats(prog, attr_name, rsize, arr) {
    var _self = this,
        gl = _self.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);

    var attr = gl.getAttribLocation(prog, attr_name);

    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, rsize, gl.FLOAT, false, 0, 0);
};

glProgram.prototype.draw = function draw() {
    var _self = this,
        gl = _self.gl;

    gl.clearColor(0.8, 0.8, 0.8, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var prog = _self.shaderProgram(_self.vertexShader, _self.fragmentShader);

    gl.useProgram(prog);

    _self.attributeSetFloats(prog, "pos", 3, [
        -1, 1, 0,
        1, 1, 0,
        -1, -1, 0,
        1, -1, 0
    ]);

    var uni = gl.getUniformLocation(prog, "scale"); // Getting location

    var derp = (Math.sin(_self.frameNum / 10) + 2) / 2;
    gl.uniform1f(uni, derp * 10);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    _self.frameNum++;
    requestAnimFrame(_self.draw.bind(_self));
};

glProgram.prototype.run = function run() {
    var _self = this;

    function init() {
        try {
            _self.gl = document
                .getElementById("webgl")
                .getContext("experimental-webgl");

            if (!_self.gl) {
                throw "x";
            }
        }
        catch (err) {
            throw "Your web browser does not support WebGL!";
        }

        _self.draw();
    }

    setTimeout(init, 100);
}
