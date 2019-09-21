var firebaseConfig = {
    apiKey: "AIzaSyCCi7GfI3exDHC5UgFHxbRxF32vkBI4j9w",
    authDomain: "train-schedule-7ff9b.firebaseapp.com",
    databaseURL: "https://train-schedule-7ff9b.firebaseio.com",
    projectId: "train-schedule-7ff9b",
    storageBucket: "",
    messagingSenderId: "171691107404",
    appId: "1:171691107404:web:3855483f3b40c728bd80e9"
};

firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var trainsRef = database.ref('/trains');

$("#frequency").on("click", function (event) {
    event.preventDefault();
    if ($("#train-name-input").val() === "" || $("#destination-input").val() === "" || $("#first-train").val() === "" || $("#frequency-input").val() === "") {
        $("#required").text("Please fill out all the fields");
    } else {
        var trainName = $("#train-name-input").val().trim();
        var destination = $("#destination-input").val().trim();
        var firstTrain = $("#first-train").val().trim();
        var frequency = $("#frequency-input").val().trim();

        var newTrain = {
            trainName,
            destination,
            firstTrain,
            frequency
        };

        trainsRef.child(trainName).set(newTrain);

        $("#train-name-input").val("");
        $("#destination-input").val("");
        $("#first-train").val("");
        $("#frequency-input").val("");
        $("#required").text("");
    }
});

trainsRef.on("child_added", function (childSnapshot) {
    var trainName = childSnapshot.val().trainName;
    var destination = childSnapshot.val().destination;
    var firstTrain = childSnapshot.val().firstTrain;
    var frequency = childSnapshot.val().frequency;

    var result = calculations(firstTrain, frequency);

    var newRow = $("<tr>").append(
        $("<td>").text(trainName),
        $("<td>").text(destination),
        $("<td>").text(frequency),
        $("<td>").text(result[0]),
        $("<td>").text(result[1])
    );

    $("#train-table > tbody").append(newRow);
});

function calculations(firstTrainTime, freq) {
    var firstTrainConverted = moment(firstTrainTime, "HH:mm").subtract(1, "years");
    var diffTime = moment().diff(moment(firstTrainConverted), "minutes");
    var remainder = diffTime % freq;
    var minutesAway = freq - remainder;
    var nextTrain = moment().add(minutesAway, "minutes").format('LT');

    return [nextTrain, minutesAway];
}


function updateSchedule() {
    $("tbody").empty();
    console.log('updated');
    trainsRef.on('child_added', function (snapshot) {
        var frequency = snapshot.val().frequency;
        var firstTrain = snapshot.val().firstTrain;
        res = calculations(firstTrain, frequency);
        var trainName = snapshot.val().trainName;
        var destination = snapshot.val().destination;

        var result = calculations(firstTrain, frequency);

        var newRow = $("<tr>").append(
            $("<td>").text(trainName),
            $("<td>").text(destination),
            $("<td>").text(frequency),
            $("<td>").text(result[0]),
            $("<td>").text(result[1])
        );

        $("#train-table > tbody").append(newRow);
    })
}

setInterval(updateSchedule, 60000);


