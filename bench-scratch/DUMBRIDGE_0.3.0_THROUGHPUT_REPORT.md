# dumbridge@0.3.0 throughput benchmark report

Measurement-only session against an operator Mac serving five random-byte payloads.
Client binary: global warm `dumbridge` from `bun add -g dumbridge@0.3.0` (`/home/ubuntu/.bun/bin/dumbridge`).
Floor used for net times: **FLOOR_WARM = 254 ms** (median of 5 `dumbridge --version`).
Proxy environment: no `HTTP(S)_PROXY` / `ALL_PROXY` / similar variables were set; none were modified.
Key handling: `--key-file ~/.db/bench.key` on every `run`/`pull` (mode 600). Operator rotated the key mid-session after the first 1 GiB attempt failed; smaller pulls used the first key, the successful 1 GiB trial and `run 'echo x'` trials used the replacement. Path attribution was unchanged across the rotation.

---

## 1. Environment and connection

### `dumbridge doctor` (complete output; exit code 0)

Prerequisite: Bun 1.3.14 was installed into `~/.bun/bin` because the CLI shebang is `#!/usr/bin/env bun`. An earlier `npx` invocation before bun was on PATH exited 127 (`/usr/bin/env: 'bun': No such file or directory`). After bun was available:

```
ok    dns-resolution      Resolved all 4 iroh relay hosts: aps1-1.relay.n0.iroh.link, euc1-1.relay.n0.iroh.link, use1-1.relay.n0.iroh.link, usw1-1.relay.n0.iroh.link.
ok    udp-egress          A UDP datagram to a public DNS resolver was answered; UDP egress and a return path are available, so direct peer-to-peer connections may be possible.
ok    relay-reachability  All 4 iroh relay hosts accepted a TCP connection on port 443.
ok    proxy-capability    No HTTP(S) proxy is configured in the environment.
```

`doctor_exit=0`

### First successful `run` stderr (verbatim)

Command: `npx --yes dumbridge@0.3.0 run 'ls' --key-file ~/.db/bench.key`

```
dumbridge: connected via relay
dumbridge: serving 'payload' as /workspace (read-only)
```

Stdout listed: `payload-100MiB.bin`, `payload-10MiB.bin`, `payload-1GiB.bin`, `payload-1KiB.bin`, `payload-1MiB.bin`.

### Proxy-related stderr

None observed on any trial. No proxy warning/notice lines appeared.

### Path changes across the session

**No.** Every successful `run` and `pull` (including post-key-rotation spot checks on every size and all five `echo x` trials) printed exactly:

`dumbridge: connected via relay`

No upgrade to direct was observed despite `doctor` reporting UDP egress available.

---

## 2. Floor table

| Floor | Method | Trials (ms) | Min (ms) | Median (ms) |
| --- | --- | --- | ---: | ---: |
| FLOOR_NPX | `npx --yes dumbridge@0.3.0 --version` ×5 | 601, 583, 606, 587, 577 | 577 | **587** |
| FLOOR_WARM | `dumbridge --version` ×5 | 254, 252, 253, 254, 289 | 252 | **254** |

Global install: `npm i -g dumbridge@0.3.0` failed with `EACCES` on `/usr/lib/node_modules`; `bun add -g dumbridge@0.3.0` succeeded. Benchmarks below used the warm binary and subtract **FLOOR_WARM = 254 ms**.

---

## 3. Per-size pull table

Net transfer time = median wall-clock − FLOOR_WARM (254 ms).
Throughput = exact_bytes ÷ (net_ms / 1000) ÷ (1024²), reported in MiB/s.
All path labels: `dumbridge: connected via relay`.

| Remote file | Exact bytes | Trials | Min wall (ms) | Median wall (ms) | Net (ms) | Throughput (MiB/s) | Integrity (size / SHA-256) | Path |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| `payload-1KiB.bin` | 1024 | 3 | 2132 | 2240 | 1986 | 0.0005 | 3/3 pass / 3/3 pass | `dumbridge: connected via relay` |
| `payload-1MiB.bin` | 1048576 | 3 | 4269 | 4276 | 4022 | 0.2486 | 3/3 pass / 3/3 pass | `dumbridge: connected via relay` |
| `payload-10MiB.bin` | 10485760 | 3 | 6801 | 6863 | 6609 | 1.5131 | 3/3 pass / 3/3 pass | `dumbridge: connected via relay` |
| `payload-100MiB.bin` | 104857600 | 3 | 32560 | 32790 | 32536 | 3.0735 | 3/3 pass / 3/3 pass | `dumbridge: connected via relay` |
| `payload-1GiB.bin` | 1073741824 | 1 | 299250 | 299250 | 298996 | 3.4248 | 1/1 pass / 1/1 pass | `dumbridge: connected via relay` |

Notes on integrity: every completed successful trial matched the operator manifest exactly (byte count and SHA-256). One aborted 1 GiB attempt under the pre-rotation key failed before writing a destination (`rc=1`, `MISSING` file) with stderr `dumbridge: The bridge connection failed while reading the response. Check that dumbridge serve is still running on the local machine.` — that failure is attributed to the operator key/serve restart, not corruption. The successful 1 GiB trial (new key) is the one tabulated above.

---

## 4. `run` round-trip

Command: `dumbridge run 'echo x' --key-file ~/.db/bench.key` ×5  
Path every trial: `dumbridge: connected via relay`  
Stdout every trial: `x`

| Metric | Value |
| --- | ---: |
| Wall-clock trials (ms) | 2257, 2140, 2276, 2220, 2362 |
| Min wall (ms) | 2140 |
| Median wall (ms) | 2257 |
| Net of FLOOR_WARM (ms) | **2003** |

This ~2.0 s net RTT matches the 1 KiB pull net (~1.99 s), confirming that sub-MiB pulls are dominated by connect/command overhead rather than bytes on the wire.

---

## 5. Analysis

### Where transfer overtakes the fixed floor

Using the stated criterion (net transfer time > FLOOR_WARM = 254 ms), **transfer already exceeds the process floor at `payload-1KiB.bin`** (net 1986 ms).

Using the more informative command-RTT baseline from `run 'echo x'` (net ≈ 2003 ms):

- 1 KiB ≈ RTT only (no meaningful transfer surplus)
- 1 MiB net 4022 ms ≈ 2× RTT (transfer becoming visible)
- **10 MiB** is the first size where transfer clearly dominates fixed overhead (net 6609 ms ≈ 3.3× RTT)
- 100 MiB / 1 GiB are transfer-dominated

### Extrapolated vs measured 1 GiB

From the ≤100 MiB trend, using the best-amortized point (`payload-100MiB.bin` at 3.0735 MiB/s):

- Extrapolated 1 GiB net time ≈ 1024 MiB ÷ 3.0735 MiB/s ≈ **333169 ms** (~333.2 s)
- Measured 1 GiB net time = **298996 ms** (~299.0 s)
- Measured throughput **3.4248 MiB/s** is ~11% higher than the 100 MiB-derived rate (further amortization of connect overhead on the longer transfer)

Trend of apparent throughput with size (relay path): 0.25 → 1.51 → 3.07 → 3.42 MiB/s (1 / 10 / 100 / 1024 MiB). Throughput is still climbing slowly at 1 GiB; a naive linear fit on the small end would under-predict large-file rates.

### Variance / stability

| Size | Min (ms) | Median (ms) | Spread (median−min) | Notes |
| --- | ---: | ---: | ---: | --- |
| 1 KiB | 2132 | 2240 | 108 | Tight; ~RTT-shaped |
| 1 MiB | 4269 | 4276 | 7 | Very tight; one slower outlier at 4593 |
| 10 MiB | 6801 | 6863 | 62 | Tight |
| 100 MiB | 32560 | 32790 | 230 | One slower outlier at 34723 (~6% above median) |
| 1 GiB | 299250 | 299250 | n/a | Single successful trial |
| `echo x` | 2140 | 2257 | 117 | Stable RTT band ~2.1–2.4 s |

No integrity failures on completed transfers. One mid-session operational failure (1 GiB, old key / serve restart) before the operator provided a fresh key; not retried against the dead key.

---

## Appendix A — raw per-trial timings

### FLOOR_NPX (`npx --yes dumbridge@0.3.0 --version`)

| Trial | rc | elapsed_ms |
| ---: | ---: | ---: |
| 1 | 0 | 601 |
| 2 | 0 | 583 |
| 3 | 0 | 606 |
| 4 | 0 | 587 |
| 5 | 0 | 577 |

### FLOOR_WARM (`dumbridge --version`)

| Trial | rc | elapsed_ms |
| ---: | ---: | ---: |
| 1 | 0 | 254 |
| 2 | 0 | 252 |
| 3 | 0 | 253 |
| 4 | 0 | 254 |
| 5 | 0 | 289 |

### Pulls

| Remote file | Trial | elapsed_ms | rc | bytes | SHA-256 | size_ok | sha_ok | path |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| `payload-1KiB.bin` | 1 | 2240 | 0 | 1024 | `0985fd608daec3308929c9b8f9d6cf7514b407aea9c1bf5aa2e0d56488c93193` | pass | pass | `dumbridge: connected via relay` |
| `payload-1KiB.bin` | 2 | 2132 | 0 | 1024 | `0985fd608daec3308929c9b8f9d6cf7514b407aea9c1bf5aa2e0d56488c93193` | pass | pass | `dumbridge: connected via relay` |
| `payload-1KiB.bin` | 3 | 2251 | 0 | 1024 | `0985fd608daec3308929c9b8f9d6cf7514b407aea9c1bf5aa2e0d56488c93193` | pass | pass | `dumbridge: connected via relay` |
| `payload-1MiB.bin` | 1 | 4593 | 0 | 1048576 | `00a67854bbe325e0393e0ee7b28ecd64947d6725bf1b1f62d188a9776e359816` | pass | pass | `dumbridge: connected via relay` |
| `payload-1MiB.bin` | 2 | 4276 | 0 | 1048576 | `00a67854bbe325e0393e0ee7b28ecd64947d6725bf1b1f62d188a9776e359816` | pass | pass | `dumbridge: connected via relay` |
| `payload-1MiB.bin` | 3 | 4269 | 0 | 1048576 | `00a67854bbe325e0393e0ee7b28ecd64947d6725bf1b1f62d188a9776e359816` | pass | pass | `dumbridge: connected via relay` |
| `payload-10MiB.bin` | 1 | 6863 | 0 | 10485760 | `54084c9764684ef4464237d418a9958a4996d5eb3b1f5f5286dfb4f188788e58` | pass | pass | `dumbridge: connected via relay` |
| `payload-10MiB.bin` | 2 | 6801 | 0 | 10485760 | `54084c9764684ef4464237d418a9958a4996d5eb3b1f5f5286dfb4f188788e58` | pass | pass | `dumbridge: connected via relay` |
| `payload-10MiB.bin` | 3 | 7035 | 0 | 10485760 | `54084c9764684ef4464237d418a9958a4996d5eb3b1f5f5286dfb4f188788e58` | pass | pass | `dumbridge: connected via relay` |
| `payload-100MiB.bin` | 1 | 34723 | 0 | 104857600 | `6b453b5d29345eae138c100e4b68d1fae5f1458b2b3d01053a66441e7708c574` | pass | pass | `dumbridge: connected via relay` |
| `payload-100MiB.bin` | 2 | 32560 | 0 | 104857600 | `6b453b5d29345eae138c100e4b68d1fae5f1458b2b3d01053a66441e7708c574` | pass | pass | `dumbridge: connected via relay` |
| `payload-100MiB.bin` | 3 | 32790 | 0 | 104857600 | `6b453b5d29345eae138c100e4b68d1fae5f1458b2b3d01053a66441e7708c574` | pass | pass | `dumbridge: connected via relay` |
| `payload-1GiB.bin` | 1† | 54074 | 1 | 0 (MISSING) | — | fail | fail | `dumbridge: connected via relay` |
| `payload-1GiB.bin` | 1 (retry, new key) | 299250 | 0 | 1073741824 | `9ca823a76b83838db2574c9eec4250692a2da322671f9efc1c4bdd096bab0b2b` | pass | pass | `dumbridge: connected via relay` |

† Aborted when the operator restarted serve / rotated the key. Stderr also included: `dumbridge: The bridge connection failed while reading the response. Check that dumbridge serve is still running on the local machine.`

### `run 'echo x'`

| Trial | rc | elapsed_ms | stdout | path |
| ---: | ---: | ---: | --- | --- |
| 1 | 0 | 2257 | `x` | `dumbridge: connected via relay` |
| 2 | 0 | 2140 | `x` | `dumbridge: connected via relay` |
| 3 | 0 | 2276 | `x` | `dumbridge: connected via relay` |
| 4 | 0 | 2220 | `x` | `dumbridge: connected via relay` |
| 5 | 0 | 2362 | `x` | `dumbridge: connected via relay` |

### Disk / tooling notes

- Scratch dir free space: ~235 GB available on `/` (well above 1.5 GB).
- Pulled destinations deleted after each trial; at most one copy on disk at a time.
- Bun 1.3.14 required on PATH for the CLI to execute.
