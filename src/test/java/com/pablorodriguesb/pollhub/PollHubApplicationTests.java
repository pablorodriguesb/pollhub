package com.pablorodriguesb.pollhub;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
class PollHubApplicationTests {

	@Test
	void contextLoads() {
		System.out.println("Contexto carregado com sucesso!");
	}

}
