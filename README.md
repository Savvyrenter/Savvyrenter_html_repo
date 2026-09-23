# Savvy Renter — free calculators and resources for renters

I built this tool to work out exactly how much my property agent owed me after an error led to an ongoing rent increase. Once I had the sums right for myself, I put it online for free to save other tenants the headache of working it out by hand.

## The legal bit

This tool is a guide, not formal legal advice. The arithmetic follows the way county courts read a claim for interest, but you use it at your own risk. Double-check your final figures with Citizens Advice or Shelter before putting them to a court, a tribunal, or in a Letter Before Action. I am not a solicitor and accept no liability for your claim.

## How the sums work — the increasing principal sum

Most calculators put interest on one lump sum from one date. That is wrong for rent overpayments, because you paid month by month: the principal sum owed to you was increasing the whole time. Your first overpayment has been held the longest and earns the most interest; your last one the least. This tool adds each payment to the running balance on the day it was made, charges simple interest on that balance for the days until the next payment (balance × rate × days ÷ 365), and adds it all up. Interest is never charged on interest. A late first payment does not shift the rest — later payments are counted on the day the rent falls due.

## What you get

A statement laid out for the court: the number of payments, the sums overpaid, the interest to date and the total as at the date you choose; the basis; the method in plain English; one line per payment; and, where the overpayment is still going on, a note that the figure is rising by so much a day and should be worked again on the day of the hearing. Print it, or save it as a PDF, from the button on the page.

## Setup

Everything runs in your browser. Nothing you type is stored, sent anywhere, or remembered — close the page and it is gone. There is no server and no network call. Open `index.html` in any browser, or host the folder as static files. The 8% rate is the usual county-court rate (County Courts Act 1984, s.69) and can be changed on the page.

## Files

`index.html` — the home page: what the tools are and how the sums work. `interest.html` — the interest calculator (engine inside). `arrears.html` — the arrears repayment calculator: what you owe the landlord, paid down in instalments, interest only on what is left to pay (decreasing principal sum). `readme.html` — the README as a page. `resources.html` — the index of official pages (EPC, Gas Safe, deposit schemes, Companies House, Land Registry, the Acts, courts and free advice). `SavvyRenter.png`, `SavvyRenter-sml.png`, `favicon.*`, `apple-touch-icon.png`, `site.webmanifest` — branding and icons.

Savvy Renter — savvyrenter.co.uk · free tools for renters
