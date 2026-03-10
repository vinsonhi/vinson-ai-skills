# Marketing Filter

Use this file when Xiaohongshu search results are likely polluted by merchant promotion, affiliate travel notes, or disguised ads.

## High-Risk Signals

Increase `marketing_score` when any of these appear:

- Author name or note text contains `民宿`, `酒店`, `度假村`, `旅行社`, `定制`, `代订`, `地接`, `客服`, `管家`, `vx`, `vx`, `私信`, `滴滴我`, `可订`
- Author nickname itself is tightly coupled to the current search topic, for example `{topic}官方`, `{topic}测评号`, `{topic}代购`, `{topic}管家`, `{topic}顾问`
- Profile bio contains role words or transaction intent, such as `咨询`, `预定`, `接单`, `顾问`, `合作`, `团购`, `领队`, `测评号`
- Strong call-to-action phrases such as `冲`, `闭眼入`, `放心住`, `最后几间`, `订房`, `报价`, `优惠`, `套餐`, `需要的扣1`
- Text structure is generic praise with little verifiable detail
- Comments repeat identical praise or redirect to direct contact
- The author's profile feed is dominated by the same searched topic, brand, destination, product line, or selling angle across many recent posts

## Authentic Signals

Decrease relative risk when the note or comments include:

- Concrete prices, dates, route details, or transfer constraints
- Mixed sentiment, including drawbacks
- Specific operational details: Wi-Fi, boat noise, tides, bugs, room age, meal quality, check-in process
- Comparisons with alternative hotels, islands, or room types
- User questions answered with precise and inconvenient truths
- The author's profile is mostly daily life or unrelated topics instead of continuous posting about the currently searched topic or product

When judging "same-topic concentration", keep it generic:

- destination search: repeated destination, hotel, itinerary, room-type, booking posts
- product search: repeated posts about the same product, category, affiliate link, or selling angle
- service search: repeated posts about the same agency, consultant role, conversion funnel, or lead capture pattern

## Review Guidance

Treat `marketing_score >= 60` as high risk and down-rank heavily.

For `40-59`, inspect media and comments manually.

For `< 40`, prefer these notes when building the final summary, but still cross-check against at least two independent notes or comment threads.

Before doing deep review, filter from the search page first:

- do not open notes purely in rank order
- build a mixed candidate set from different post styles and different apparent user types
- then inspect details, comments, and profile history on the selected set

When summarizing findings, keep post-body evidence and comment-thread evidence separate. Count repeated points across independent notes or comment threads instead of collapsing everything into one vague conclusion.
