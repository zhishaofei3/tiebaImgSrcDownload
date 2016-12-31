function square(n, done) {
    console.log(n);
    setTimeout(function () {
        done(null, n + 2);
    }, 1000);
}
var Serial = require('node-serial');
var serial = new Serial();
serial.timeout(10000);
[7, 8].forEach(function (x, xx) {
    serial.add(function (done, ctx) {
//        console.log("ctx.res");
//        console.log(ctx.res);
        square(1 + ctx.res || 0, function (err, res) {
            done(err, res);
        })
    })
})
serial.done(function (err, ctx) {
    if (err) throw err;
    console.log(ctx.res);
    // ctx.res => 25
});