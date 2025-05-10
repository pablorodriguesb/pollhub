package com.pablorodriguesb.pollhub.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class AcessDeniedException extends RuntimeException {
  public AcessDeniedException(String message) {
    super(message);
  }
}
