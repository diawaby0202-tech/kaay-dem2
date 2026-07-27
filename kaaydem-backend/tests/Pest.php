<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| RefreshDatabase migre une base de test à chaque exécution et annule
| chaque test dans une transaction : aucun test ne peut polluer les
| données d'un autre. Appliqué uniquement aux tests "Feature" (ceux qui
| appellent l'API), pas aux tests "Unit" (qui n'ont pas besoin de base).
|
*/

uses(TestCase::class, RefreshDatabase::class)->in('Feature');
