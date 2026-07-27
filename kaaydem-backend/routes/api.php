<?php

use App\Http\Controllers\Api\Admin\AdminDriverRequestController;
use App\Http\Controllers\Api\Admin\AdminExportController;
use App\Http\Controllers\Api\Admin\AdminReportController;
use App\Http\Controllers\Api\Admin\AdminStatsController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DriverRequestController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\TripController;
use App\Http\Controllers\Api\WalletController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // --- Routes publiques (pas besoin d'être connecté) ---
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Recherche et détail des trajets : publics (le visiteur peut consulter, EF-04)
    Route::get('/trips', [TripController::class, 'index']);
    Route::get('/trips/{trip}', [TripController::class, 'show']);

    // --- Routes protégées (token Sanctum requis) ---
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/me', [AuthController::class, 'updateMe']);

        Route::post('/driver-requests', [DriverRequestController::class, 'store']);

        // Notifications (EF-06 : cloche/badge)
        Route::get('/me/notifications', [NotificationController::class, 'index']);

        // Portefeuille virtuel (exigence bonus : paiement simulé)
        Route::get('/me/transactions', [WalletController::class, 'index']);

        // Tableau de bord (EF-08)
        Route::get('/me/trips', [TripController::class, 'mesTrajets']);
        Route::get('/me/reservations', [ReservationController::class, 'mesReservations']);

        // Publier / modifier / annuler / clôturer un trajet (EF-03)
        Route::post('/trips', [TripController::class, 'store']);
        Route::put('/trips/{trip}', [TripController::class, 'update']);
        Route::delete('/trips/{trip}', [TripController::class, 'destroy']);
        Route::patch('/trips/{trip}/close', [TripController::class, 'close']);

        // Réservations (EF-05, EF-06)
        Route::post('/trips/{trip}/reservations', [ReservationController::class, 'store']);
        Route::patch('/reservations/{reservation}/accept', [ReservationController::class, 'accept']);
        Route::patch('/reservations/{reservation}/refuse', [ReservationController::class, 'refuse']);
        Route::patch('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);

        // Évaluation (EF-07)
        Route::post('/reservations/{reservation}/review', [ReviewController::class, 'store']);

        // Signalement (l'autre partie d'une réservation confirmée/terminée)
        Route::post('/reservations/{reservation}/report', [ReportController::class, 'store']);

        // Messagerie interne (exigence bonus)
        Route::get('/reservations/{reservation}/messages', [MessageController::class, 'index']);
        Route::post('/reservations/{reservation}/messages', [MessageController::class, 'store']);

        // --- Administration (EF-08, EF-09) — protégées par Gate::define('admin') ---
        Route::prefix('admin')->group(function () {
            Route::get('/users', [AdminUserController::class, 'index']);
            Route::patch('/users/{user}', [AdminUserController::class, 'update']);

            Route::get('/driver-requests', [AdminDriverRequestController::class, 'index']);
            Route::patch('/driver-requests/{driverProfile}', [AdminDriverRequestController::class, 'update']);

            Route::get('/reports', [AdminReportController::class, 'index']);
            Route::patch('/reports/{report}', [AdminReportController::class, 'update']);

            Route::get('/stats', [AdminStatsController::class, 'index']);

            // Export CSV des trajets (exigence bonus)
            Route::get('/trips/export', [AdminExportController::class, 'trips']);
        });
    });

});