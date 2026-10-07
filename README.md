# Vehicle Flip Analyzer

A simple, private, local vehicle-flip calculator. No account, package installation, or internet connection is needed. Costs are in USD. Your own mechanical, body, detailing, and PDR labor is **not** automatically counted as a cash expense.

## Run locally (easiest option)

1. Download or copy the entire `vehicle-flip-analyzer` folder to your computer.
2. Open the folder and double-click **index.html**. It opens in your web browser.
3. Enter your purchase price, resale estimate, cash costs, and targets. Results update as you type. Click **Load example** to try a sample deal or **Clear deal** to start over.

Keep `index.html`, `styles.css`, `calculator.js`, and `app.js` together. The app runs directly from the file and does not require a server. It does not save your entries; refreshing or closing the page clears them.

## Optional: use a local server

If Python 3 is installed, open a terminal in this folder and run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

On Windows, use `py -m http.server 8000 --bind 127.0.0.1` instead. Open **http://localhost:8000** in your browser. Press **Ctrl+C** in the terminal to stop the server.

## Calculations

- **Total cash invested** = purchase price + auction fees + transportation + parts/repairs + miscellaneous costs.
- **Expected gross profit** = expected resale price − total cash invested.
- **ROI** = expected gross profit ÷ total cash invested × 100. ROI is shown as N/A if investment is zero.
- **Break-even sale price** = total cash invested.
- **Maximum purchase price** = expected resale price − all other cash costs − target profit. This buying limit enforces the profit target only, not the minimum ROI. If negative, even a free vehicle cannot meet the profit target.

Assessment rules:

- **Buy:** positive profit, profit meets your target, and ROI meets your minimum.
- **Maybe:** positive profit but at least one target is missed, or ROI is undefined.
- **Pass:** zero or negative profit.

Default targets are $2,000 profit and 20% ROI; change them to suit your deals. Year, make, model, and mileage are descriptive and do not adjust resale or repair estimates automatically. Enter costs as fixed amounts, including auction fees for the price you are considering. If fees change with the bid, update them before relying on the buying limit. Add applicable taxes, title costs, paid outside labor, and selling expenses to the cash costs yourself. No automatic taxes, fees, or labor charges are assumed. Gross profit here is the estimated cash surplus before any unentered expenses and income taxes.

The example has $6,200 invested, $2,300 expected profit, 37.1% ROI, a $6,200 break-even price, and a $4,800 maximum purchase price for a $2,000 target.

## Developer checks (optional)

With Node.js installed, run `node --test calculator.test.js` in this folder. The app itself does not require Node.js. `calculator.js` contains the calculation rules, `app.js` handles the interface, and `styles.css` controls the appearance.
