import React from "react";

export function DoBetMessage({chooseNumber}) {
  return (
      <div>
          <h4>Do Bet!</h4>
          <form
              onSubmit={(event) => {
                  // This function just calls the transferTokens callback with the
                  // form's data.
                  event.preventDefault();

                  const formData = new FormData(event.target);
                  const numberBet = formData.get("numberBet");

                  if (numberBet) {
                      chooseNumber(numberBet);
                  }
              }}
          >
              <div className="form-group">
                  <label>What Number do you choose?</label>
                  <input
                      className="form-control"
                      type="number"
                      step="1"
                      name="numberBet"
                      required
                  />
              </div>
              <div className="form-group">
                  <input className="btn btn-primary" type="submit" value="Bet" />
              </div>
          </form>
      </div>
  );
}
