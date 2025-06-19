<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserOutlet extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Schema::create('user_outlet', function (Blueprint $table) {
        //     $table->string('id' , 15)->primary();
        //     $table->foreignId('user_id')->references('id')->on('users');
        //     $table->string('outlet_id' , 15);
        //     $table->foreign('outlet_id')->references('id')->on('outlet')->cascadeOnDelete()->cascadeOnUpdate();
        //     $table->timestamps();
        // });

        Schema::create('user_outlet', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->onUpdate('cascade');
            $table->string('outlet_id', 15);
            $table->foreign('outlet_id')->references('id')->on('outlet')->onDelete('cascade')->onUpdate('cascade');
            $table->timestamps();

            $table->primary(['user_id', 'outlet_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_outlet');
    }
}
