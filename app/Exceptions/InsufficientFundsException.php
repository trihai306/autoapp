<?php

namespace App\Exceptions;

use Exception;

class InsufficientFundsException extends Exception
{
    public function __construct($message = "Insufficient funds.", $code = 0, Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
