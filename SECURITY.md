# Security policy

## Supported versions

Security fixes are applied to the current production release line.

| Version | Supported |
| --- | --- |
| `1.x` | Yes |
| `< 1.0` | No |

## Reporting a vulnerability

Do not disclose a vulnerability, token, private endpoint or infrastructure detail in a public issue.

Report concerns privately through GitHub's **Report a vulnerability** form when private vulnerability reporting is enabled for the repository. If that channel is unavailable, contact Rahul through the email address published on [rahulsinghparmar.site](https://rahulsinghparmar.site) with the subject `Portfolio security report`.

Include:

- the affected route, component or release;
- reproduction steps with the minimum necessary data;
- the expected and observed behavior;
- likely impact;
- any safe mitigation already tested.

Do not include live credentials or attempt destructive testing. Acknowledgement and remediation timing depend on severity and reproducibility; no fixed bounty or disclosure window is promised.

## Scope

In scope:

- this repository and its production container;
- `rahulsinghparmar.site` application behavior;
- accidental exposure of application secrets or private monitoring data.

Provider dashboards, unrelated `parmar.homes` services, social accounts and denial-of-service testing are out of scope unless Rahul explicitly authorizes them.
