import React from "react";

export function PickANumber({pickANumber}) {
  return (
      <div>
          <h4>Pick & Bet!</h4>
          <form
              onSubmit={(event) => {
                  // This function just calls the transferTokens callback with the
                  // form's data.
                  event.preventDefault();

                  const formData = new FormData(event.target);
                  const numberBet = formData.get("numberBet");

                  if (numberBet) {
                      pickANumber(numberBet);
                  }
              }}
          >
              <div className="form-group">
                  <label>What Number do you pick?</label>
                  <input
                      className="form-control"
                      type="number"
                      step="1"
                      name="numberBet"
                      required
                  />
              </div>
              <div className="form-group">
                  <input className="btn btn-primary" type="submit" value="Pick & Bet!" />
              </div>
          </form>
      </div>
  );
}
