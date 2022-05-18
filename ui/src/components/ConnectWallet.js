import React from "react";

import { NetworkErrorMessage } from "./NetworkErrorMessage";
import { LotUbiHeader } from "./LotUbiHeader";

export function ConnectWallet({ connectWallet, networkError, dismiss}) {
  return (
    <div className="container p-4">
    <div className="row">
      <div className="col-12 text-center">
        {networkError && (
          <NetworkErrorMessage
            message={networkError}
            dismiss={dismiss}
          />
        )}
      </div>
      <LotUbiHeader/>
    </div>
    <hr />
    <div>
      <p>
        <button
          className="btn btn-warning"
          type="button"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      </p>
    </div>
  </div>
  );
}
