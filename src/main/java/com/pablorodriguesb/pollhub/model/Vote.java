package com.pablorodriguesb.pollhub.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "votes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "poll_id"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "option_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_vote_option",
                    foreignKeyDefinition = "FOREIGN KEY (option_id)" +
                            " REFERENCES options(id) ON DELETE CASCADE"
            )
    )
    @ToString.Exclude
    private Option option;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    @ToString.Exclude
    private Poll poll;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime votedAt;
}
