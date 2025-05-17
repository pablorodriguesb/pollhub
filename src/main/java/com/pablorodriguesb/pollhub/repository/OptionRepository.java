package com.pablorodriguesb.pollhub.repository;

import com.pablorodriguesb.pollhub.model.Option;
import org.springframework.data.jpa.repository.JpaRepository;


public interface OptionRepository extends JpaRepository<Option, Long> {
}
