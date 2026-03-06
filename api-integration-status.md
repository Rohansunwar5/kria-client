# Frontend API Integration Status

> Auto-generated tracking document. Based on endpoints defined in `server/backend.md`.

---

## Player Authentication (`/player/auth/`)

| Method | Endpoint | Status | Notes |
|--------|----------|--------|-------|
| POST | `/register` | ✅ Integrated | `authSlice.registerUser` |
| POST | `/verify-otp` | ✅ Integrated | `authSlice.verifyOtp` |
| POST | `/set-password` | ✅ Integrated | `authSlice.setPassword` |
| POST | `/resend-otp` | ❌ Remaining | |
| POST | `/login` | ✅ Integrated | `authSlice.loginUser` |
| POST | `/login/otp` | ✅ Integrated | `authSlice.requestLoginOtp` |
| POST | `/login/otp/verify` | ✅ Integrated | `authSlice.verifyLoginOtp` |
| POST | `/forgot-password` | ❌ Remaining | ForgotPasswordPage exists but not wired |
| POST | `/reset-password` | ❌ Remaining | |
| POST | `/refresh-token` | ❌ Remaining | |
| GET | `/profile` | ❌ Remaining | |
| PATCH | `/profile` | ✅ Integrated | `authSlice.updateProfile` |
| PUT | `/profile-image` | ❌ Remaining | |
| POST | `/change-password` | ❌ Remaining | |
| POST | `/fcm-token` | ❌ Remaining | |
| DELETE | `/fcm-token` | ❌ Remaining | |

---

## Organizer Authentication (`/organizer/auth/`)

| Method | Endpoint | Status | Notes |
|--------|----------|--------|-------|
| POST | `/register` | ✅ Integrated | `authSlice.registerUser` (role='organizer') |
| POST | `/verify-otp` | ✅ Integrated | `authSlice.verifyOtp` |
| POST | `/set-password` | ✅ Integrated | `authSlice.setPassword` |
| POST | `/resend-otp` | ❌ Remaining | |
| POST | `/login` | ✅ Integrated | `authSlice.loginUser` |
| POST | `/login/otp` | ✅ Integrated | `authSlice.requestLoginOtp` |
| POST | `/login/otp/verify` | ✅ Integrated | `authSlice.verifyLoginOtp` |
| POST | `/forgot-password` | ❌ Remaining | |
| POST | `/reset-password` | ❌ Remaining | |
| POST | `/refresh-token` | ❌ Remaining | |
| GET | `/profile` | ❌ Remaining | |
| PATCH | `/profile` | ✅ Integrated | `authSlice.updateProfile` |
| PUT | `/profile-image` | ❌ Remaining | |
| PATCH | `/organization` | ❌ Remaining | Update organization details |
| POST | `/change-password` | ❌ Remaining | |
| POST | `/fcm-token` | ❌ Remaining | |
| DELETE | `/fcm-token` | ❌ Remaining | |

---

## Tournaments (`/tournament/`)

| Method | Endpoint | Status | Notes |
|--------|----------|--------|-------|
| GET | `/` | ✅ Integrated | `tournamentSlice.fetchPublicTournaments` |
| GET | `/:id` | ✅ Integrated | `tournamentSlice.fetchTournament` |
| GET | `/organizer/my-tournaments` | ✅ Integrated | `tournamentSlice.fetchMyTournaments` |
| POST | `/` | ✅ Integrated | `tournamentSlice.createTournament` |
| PUT | `/:id` | ✅ Integrated | `tournamentSlice.updateTournament` |
| DELETE | `/:id` | ✅ Integrated | `tournamentSlice.deleteTournament` |
| POST | `/:id/open-registration` | ✅ Integrated | `tournamentSlice.openRegistration` |
| POST | `/:id/close-registration` | ✅ Integrated | `tournamentSlice.closeRegistration` |
| POST | `/:id/start-auction` | ✅ Integrated | `tournamentSlice.startAuction` |
| POST | `/:id/start` | ✅ Integrated | `tournamentSlice.startTournament` |
| POST | `/:id/complete` | ✅ Integrated | `tournamentSlice.completeTournament` |
| POST | `/:id/cancel` | ✅ Integrated | `tournamentSlice.cancelTournament` |
| POST | `/:id/staff` | ❌ Remaining | Add staff member |
| DELETE | `/:id/staff/:staffId` | ❌ Remaining | Remove staff member |

---

## Teams

| Method | Endpoint | Status | Notes |
|--------|----------|--------|-------|
| GET | `/tournaments/:tournamentId/teams` | ✅ Integrated | `teamSlice.fetchTournamentTeams` |
| GET | `/teams/:id` | ❌ Remaining | |
| POST | `/tournaments/:tournamentId/teams` | ✅ Integrated | `teamSlice.createTeam` |
| PUT | `/teams/:id` | ✅ Integrated | `teamSlice.updateTeam` |
| DELETE | `/teams/:id` | ✅ Integrated | `teamSlice.deleteTeam` |
| PUT | `/teams/:id/budget` | ✅ Integrated | `teamSlice.updateTeamBudget` |
| POST | `/teams/:id/reset-budget` | ✅ Integrated | `teamSlice.resetTeamBudget` |

---

## Categories

| Method | Endpoint | Status | Notes |
|--------|----------|--------|-------|
| GET | `/tournaments/:tournamentId/categories` | ✅ Integrated | `categorySlice.fetchTournamentCategories` |
| GET | `/categories/:id` | ✅ Integrated | `categorySlice.fetchCategory` |
| POST | `/tournaments/:tournamentId/categories` | ✅ Integrated | `categorySlice.createCategory` |
| PUT | `/categories/:id` | ✅ Integrated | `categorySlice.updateCategory` |
| DELETE | `/categories/:id` | ✅ Integrated | `categorySlice.deleteCategory` |
| POST | `/categories/:id/open-registration` | ✅ Integrated | `categorySlice.openCategoryRegistration` |
| POST | `/categories/:id/start-auction` | ✅ Integrated | `categorySlice.startCategoryAuction` |
| POST | `/categories/:id/configure-bracket` | ✅ Integrated | `MatchManagementSection` calls directly |
| POST | `/categories/:id/start` | ✅ Integrated | `categorySlice.startCategory` |
| POST | `/categories/:id/complete` | ✅ Integrated | `categorySlice.completeCategory` |

---

## Tournament Registration (`/registrations/`)

| Method | Endpoint | Status | Notes |
|--------|----------|--------|-------|
| POST | `/register` | ✅ Integrated | `registrationSlice.registerForCategory` |
| GET | `/my-registrations` | ✅ Integrated | `registrationSlice.fetchMyRegistrations` |
| POST | `/:id/withdraw` | ✅ Integrated | `registrationSlice.withdrawRegistration` |
| GET | `/tournaments/:tournamentId` | ✅ Integrated | `registrationSlice.fetchRegistrationsByTournament` |
| GET | `/categories/:categoryId` | ✅ Integrated | `registrationSlice.fetchRegistrationsByCategory` |
| POST | `/:id/approve` | ✅ Integrated | `registrationSlice.approveRegistration` |
| POST | `/:id/reject` | ✅ Integrated | `registrationSlice.rejectRegistration` |
| POST | `/bulk-approve` | ❌ Remaining | |
| POST | `/:id/assign` | ❌ Remaining | |
| POST | `/:id/manual-assign` | ❌ Remaining | |
| POST | `/:id/unassign` | ❌ Remaining | |
| GET | `/teams/:teamId/roster` | ✅ Integrated | `TeamsTab` fetches directly |
| GET | `/categories/:categoryId/available` | ❌ Remaining | |
| POST | `/bulk-upload` | ❌ Remaining | |

---

## Auction (`/auction/`)

| Method | Endpoint | Status | Notes |
|--------|----------|--------|-------|
| GET | `/:tournamentId/:categoryId/status` | ✅ Integrated | Auction screen polling |
| GET | `/:tournamentId/:categoryId/sold-log` | ✅ Integrated | `AuctionTab` sold log display |
| POST | `/start` | ✅ Integrated | Auction screen |
| POST | `/sell` | ✅ Integrated | Auction screen |
| POST | `/next` | ✅ Integrated | Auction screen |
| POST | `/skip` | ✅ Integrated | Auction screen |
| POST | `/undo` | ✅ Integrated | Auction screen |
| POST | `/pause` | ❌ Remaining | |

---

## Matches (`/matches/`) — NEW

| Method | Endpoint | Status | Notes |
|--------|----------|--------|-------|
| GET | `/categories/:categoryId` | ✅ Integrated | `BracketTab` + `MatchManagementSection` |
| GET | `/:id` | ✅ Integrated | `matchSlice.fetchMatchById` |
| POST | `/generate/:categoryId` | ✅ Integrated | `MatchManagementSection` generate bracket |
| POST | `/:id/result` | ✅ Integrated | `MatchManagementSection` record result |
| PUT | `/:id/schedule` | ✅ Integrated | `matchSlice.updateMatchSchedule` |

---

## Sport Configuration (`/sports/`)

| Method | Endpoint | Status | Notes |
|--------|----------|--------|-------|
| GET | `/` | ❌ Remaining | |
| GET | `/:sport` | ❌ Remaining | |
| POST | `/seed` | ❌ Remaining | |
| POST | `/` | ❌ Remaining | |
| PUT | `/:id` | ❌ Remaining | |
| DELETE | `/:id` | ❌ Remaining | |

---

## Contact (`/contact/`)

| Method | Endpoint | Status | Notes |
|--------|----------|--------|-------|
| POST | `/` | ❌ Remaining | |

---

## Summary

| Section | Integrated | Remaining |
|---------|-----------|-----------|
| Player Auth | 7 | 9 |
| Organizer Auth | 7 | 10 |
| Tournaments | 12 | 2 |
| Teams | 6 | 1 |
| Categories | 10 | 0 |
| Registrations | 8 | 5 |
| Auction | 7 | 1 |
| Matches | 5 | 0 |
| Sports Config | 0 | 6 |
| Contact | 0 | 1 |
| **Total** | **62** | **35** |
