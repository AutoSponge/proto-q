onmessage = function (e) {
    if (e.data === "start") {
        var string = 'one',
        array = [1, 2, 3],
        object = {
            one: 1,
            two: "two",
            three: [3]
            };
        setTimeout(function () {postMessage(JSON.stringify(string))}, 10);
        setTimeout(function () {postMessage(JSON.stringify(array))}, 1000);
        setTimeout(function () {postMessage(JSON.stringify(object))}, 1000);
    }
}
