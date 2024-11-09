import AWS from "aws-sdk";
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "MetroTickets";

export const handler = async (event) => {
  const intentRequest = event.sessionState.intent;
  const slots = intentRequest.slots;

  // Extract slot values
  const departureStation = slots.DepartureStation.value.interpretedValue;
  const destinationStation = slots.DestinationStation.value.interpretedValue;
  const numberOfTickets = parseInt(
    slots.NumberOfTickets.value.interpretedValue,
    10
  );

  // Initialize response structure
  let response = {
    sessionState: {
      dialogAction: { type: "Close" },
      intent: {
        name: intentRequest.name,
        state: "Fulfilled",
      },
    },
    messages: [],
  };

  // Basic validation checks
  if (
    !departureStation ||
    !destinationStation ||
    isNaN(numberOfTickets) ||
    numberOfTickets <= 0
  ) {
    response.sessionState.intent.state = "Failed";
    response.messages.push({
      contentType: "PlainText",
      content:
        "Please provide a valid departure station, destination station, and number of tickets.",
    });
    return response;
  }

  // Check that the departure and destination stations are not the same
  if (departureStation === destinationStation) {
    response.sessionState.intent.state = "Failed";
    response.messages.push({
      contentType: "PlainText",
      content:
        "The departure and destination stations must be different. Please try again.",
    });
    return response;
  }

  // Generate a unique ID for the booking
  const bookingId = `BOOKING-${Date.now()}`;

  // DynamoDB item to store
  const item = {
    bookingId,
    departureStation,
    destinationStation,
    numberOfTickets,
  };

  // Save the booking in DynamoDB
  try {
    await dynamodb
      .put({
        TableName: TABLE_NAME,
        Item: item,
      })
      .promise();

    response.messages.push({
      contentType: "PlainText",
      content: `I have booked ${numberOfTickets} tickets from ${departureStation} to ${destinationStation} for you! Your booking ID is ${bookingId}.`,
    });
  } catch (error) {
    console.error("Error saving booking:", error);
    response.sessionState.intent.state = "Failed";
    response.messages.push({
      contentType: "PlainText",
      content:
        "Something went wrong while booking your tickets. Please try again later.",
    });
  }

  return response;
};
