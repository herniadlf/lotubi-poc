import React from "react";

export function PickANumber({pickANumber}) {
  return (
      <div>
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
                  <div className="form-inline">
                    <input
                      className="form-control col-3 mb-2"
                      type="number"
                      min="0"
                      step="1"
                      name="numberBet"
                      required
                    />
                    <input className="btn btn-primary mb-2 mx-sm-3" type="submit" value="Pick & Bet!" />
                  </div>
              </div>

          </form>
      </div>
  );
}
