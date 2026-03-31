src/app/(main)/scam-alerts/[citySlug]/[alertSlug]/scam-alert-client.tsx:390:37 - error TS2345: Argument of type 'ScamAlertResponseDto' is not assignable to parameter of type 'VoteableItem'.
  Types of property 'voteId' are incompatible.
    Type 'ScamAlertResponseDtoVoteId | undefined' is not assignable to type 'string | null | undefined'.
      Type '{ [key: string]: unknown; }' is not assignable to type 'string'.

390     const result = await toggleVote(localAlert as ScamAlertResponseDto);
                                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/components/scams/scam-alert-card.tsx:457:55 - error TS2345: Argument of type 'ScamAlertData' is not assignable to parameter of type 'VoteableItem'.
  Types of property 'voteId' are incompatible.
    Type 'string | Record<string, unknown> | null | undefined' is not assignable to type 'string | null | undefined'.
      Type 'Record<string, unknown>' is not assignable to type 'string'.

457                       const result = await toggleVote(alert);
                                                          ~~~~~

src/components/spots/spot-card.tsx:77:22 - error TS2345: Argument of type 'SpotWithStatsResponseDto' is not assignable to parameter of type 'VoteableItem'.
  Types of property 'voteId' are incompatible.
    Type 'SpotWithStatsResponseDtoVoteId | undefined' is not assignable to type 'string | null | undefined'.
      Type '{ [key: string]: unknown; }' is not assignable to type 'string'.

77     await toggleVote(spot);
                        ~~~~

src/components/spots/spot-header.tsx:105:7 - error TS2322: Type 'SpotWithStatsResponseDtoVoteId | undefined' is not assignable to type 'string | null | undefined'.
  Type '{ [key: string]: unknown; }' is not assignable to type 'string'.

105       voteId: spot.voteId,
          ~~~~~~

  src/hooks/use-vote-toggle.ts:30:5
    30     voteId?: string | null;
           ~~~~~~
    The expected type comes from property 'voteId' which is declared here on type 'VoteableItem'

src/hooks/api/base.ts:41:12 - error TS18048: 'nextSkip' is possibly 'undefined'.

41     return nextSkip < total ? nextSkip : undefined;
              ~~~~~~~~


Found 5 errors in 5 files.

Errors  Files
     1  src/app/(main)/scam-alerts/[citySlug]/[alertSlug]/scam-alert-client.tsx:390
     1  src/components/scams/scam-alert-card.tsx:457
     1  src/components/spots/spot-card.tsx:77
     1  src/components/spots/spot-header.tsx:105
     1  src/hooks/api/base.ts:41
 ELIFECYCLE  Command failed with exit code 2.
