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

        database.ref().push(newTrain);

        $("#train-name-input").val("");
        $("#destination-input").val("");
        $("#first-train").val("");
        $("#frequency-input").val("");
        $("#required").text("");
    }
});

database.ref().on("child_added", function (childSnapshot) {

    var trainName = childSnapshot.val().trainName;
    var destination = childSnapshot.val().destination;
    var firstTrain = childSnapshot.val().firstTrain;
    var frequency = childSnapshot.val().frequency;


    var firstTrainConverted = moment(firstTrain, "HH:mm").subtract(1, "years");
    var diffTime = moment().diff(moment(firstTrainConverted), "minutes");
    var remainder = diffTime % frequency;
    var minutesAway = frequency - remainder;
    var nextTrain = moment().add(minutesAway, "minutes").format('LT');

    var newRow = $("<tr>").append(
        $("<td>").text(trainName),
        $("<td>").text(destination),
        $("<td>").text(frequency),
        $("<td>").text(nextTrain),
        $("<td>").text(minutesAway)
    );

    $("#train-table > tbody").append(newRow);
});


