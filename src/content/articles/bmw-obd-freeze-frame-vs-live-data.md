---
title: "BMW OBD-II Freeze Frame vs. Live Data"
seoTitle: "BMW OBD-II Freeze Frame vs. Live Data Explained"
description: "Read an emissions fault snapshot, compare it with current scanner data, and save the fields a technician can use before any codes are cleared."
slug: "bmw-obd-freeze-frame-vs-live-data"
section: "guides"
publishedAt: 2026-11-15T12:00:00+05:00
category: "BMW Diagnostics"
tags: ["BMW", "MINI", "OBD-II", "Freeze Frame", "Live Data", "Diagnostics"]
relatedSlugs: ["bmw-scanner-for-used-car-inspection", "bmw-scanner-abs-airbag-codes", "bmw-no-communication-with-obd-scanner"]
featured: false
heroAlt: "Freeze-frame and live scanner data comparison"
showHero: false
author: "Chassis Signal Editorial"
readingTime: "5 min read"
safetyLevel: "LOW"
evidenceLevel: "DOCUMENTED"
affiliate: false
draft: false
---
Open freeze frame first when the problem happened earlier. It shows the operating conditions the vehicle saved for a recorded emissions fault. Then open live data to see what the vehicle reports at the time of your scan. Save the fault code and its freeze frame before any codes are cleared. Bosch's OBD1150 manual notes that erasing codes can remove the snapshot and that a higher-priority fault can overwrite it. [Bosch OBD1150 manual, sections 5.5 and 5.8](https://www.boschdiagnostics.com/sites/default/files/documents/573916%2520OBD1150%2520MNL_EN%2520Rev%2520B.pdf)

## Pick the screen that answers your question

| What you need to know | Screen to open | What to save |
|---|---|---|
| What was happening when the fault was captured? | Freeze frame | The DTC attached to the frame, engine speed, vehicle speed, load and coolant temperature when reported |
| Is the parameter behaving that way now? | Live data | The exact parameter, its units, and whether the engine was off, idling or already warm |
| Does the reading change over time? | Live-data recording, if your tool supports it | A short log with start and end times and the operating condition |
| Which fault does the snapshot belong to? | The frame details and the code list | The frame's DTC and the status shown in the code list |

Look for the code displayed with the freeze frame. A scanner may list several faults, and the snapshot on screen can belong to a different code from the one you opened first. Keep unavailable fields marked unavailable. A blank value and a numerical zero carry different meanings.

## Compare operating conditions before comparing numbers

Imagine an illustrative snapshot shows that the engine was warm, the car was moving and the engine was under load. Your next scan happens at a warm idle with the car parked. Coolant temperature might be comparable. Vehicle speed and engine load answer a different question because the operating conditions changed.

Record that difference in your handoff. “The code's frame was captured under load and the current check was at idle” describes exactly what you observed. Use the frame to choose the next test and confirm a component fault with follow-up evidence.

## Save a record in this order

1. **Identify the scan.** Note the model year, engine if known, date, tool and app version. Record whether you opened generic OBD-II or a BMW-specific module view.
2. **Save the code list.** Capture the complete DTC and each status exactly as the tool displays it. Keep the module or address if the tool reports one.
3. **Save the frame.** Capture its attached DTC, parameter labels, values and units. Preserve the whole frame before choosing which fields to highlight.
4. **Capture a stationary live comparison when useful.** Record the same available parameters and state the conditions. Use the vehicle's documented precautions and leave any on-road testing to a qualified technician when you cannot record it safely.
5. **Write the symptom in the driver's words.** Include whether it happened at startup or after driving, any warning shown and whether it recurred. Keep observations separate from a suspected cause.

A photo of the full code and frame screens is useful when your tool has no export button. Keep identifying vehicle or account details private when asking for help in a public forum.

## What an empty frame tells you

An empty freeze-frame screen gives you less evidence about the event. Start by checking whether the current app and view expose generic freeze data and whether the frame is associated with another DTC. Clearing earlier codes may have removed it. A BMW-specific tool may expose event data under a module's own diagnostic view. Use that tool's documentation for the exact car and module.

Generic OBD-II freeze data in this guide concerns the emissions diagnostic view. A parking, ABS or airbag warning needs the system-specific report from the appropriate module. Save the generic report you have, then check what the relevant BMW module requires. [BMW ABS and airbag module guide](/guides/bmw-scanner-abs-airbag-codes/)

## Sources and scope

The comparison and handoff checklist are editorial guidance built from documented scan-tool behavior. Available parameters, frame counts and BMW-specific event data vary by vehicle and tool.

- Bosch's user guide explains viewing live data, recording sampled data, identifying the DTC attached to the freeze frame and why a frame can disappear. [Bosch OBD1150 user guide, sections 5.5 through 5.8](https://www.boschdiagnostics.com/sites/default/files/documents/573916%2520OBD1150%2520MNL_EN%2520Rev%2520B.pdf)
- For a whole-car inspection, collect module coverage and missing responses alongside the emissions report. [Used BMW scanner inspection checklist](/guides/bmw-scanner-for-used-car-inspection/)
