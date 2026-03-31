This API returns functions which cannot be memoized without leading to stale UI. To prevent this, by default React Compiler will skip memoizing this component/hook. However, you may see issues if values from this API are passed to other components/hooks that are memoized.

/root/.openclaw/workspace/bkk-honest-frontend/src/components/profile/edit-profile-modal.tsx:62:23
  60 |     }, [profile, reset]);
  61 |
> 62 |     const nameValue = watch('name');
     |                       ^^^^^ React Hook Form's `useForm()` API returns a `watch()` function which cannot be memoized safely.
  63 |     const bioValue = watch('bio');
  64 |     const countryValue = watch('country');
  65 |  react-hooks/incompatible-library

/root/.openclaw/workspace/bkk-honest-frontend/src/hooks/api/base.ts
  22:5  warning  '_requireHasMore' is defined but never used  @typescript-eslint/no-unused-vars

/root/.openclaw/workspace/bkk-honest-frontend/src/hooks/api/use-social.ts
  45:19  warning  '_type' is defined but never used  @typescript-eslint/no-unused-vars

/root/.openclaw/workspace/bkk-honest-frontend/src/services/scam-alert.ts
  5:3  warning  'scamAlertsControllerFindBySlugResponse' is defined but never used  @typescript-eslint/no-unused-vars

✖ 4 problems (0 errors, 4 warnings)

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


Found 4 errors in 4 files.

Errors  Files
     1  src/app/(main)/scam-alerts/[citySlug]/[alertSlug]/scam-alert-client.tsx:390
     1  src/components/scams/scam-alert-card.tsx:457
     1  src/components/spots/spot-card.tsx:77
     1  src/components/spots/spot-header.tsx:105
 ELIFECYCLE  Command failed with exit code 2.
