# Contract ownership

| Contract                   | Producer or semantic owner                     | Consumers                      | Compatibility authority                                     |
| -------------------------- | ---------------------------------------------- | ------------------------------ | ----------------------------------------------------------- |
| Auction integration events | Bidding Service; Scheduler for lifecycle facts | Live Feed, Operations          | This repository describes wire compatibility                |
| Bidding REST API           | Bidding Service                                | Laravel BFF, Operations Portal | Bidding implementation and this normalized OpenAPI document |
| Live Feed internal access  | Bidding Service admission decision             | Live Feed                      | Bidding endpoint and service authentication                 |
| System administration API  | Bidding Service                                | Operations Portal              | Bidding endpoint and SystemAdministrator policy             |
| Client assertion admission | Bidding Service                                | Laravel BFF                    | Bidding authentication implementation                       |

Bidding owns the meaning of accepted amounts, winners, final prices, tenant
ownership, lifecycle transitions, and aggregate versions. Consumers own local
projection, persistence, and presentation behavior. Redis keys, database
schemas, UI models, ACK/NACK behavior, retry/DLQ topology, and credentials are
not shared contract artifacts.

For messaging, Bidding publishes through the transactional outbox and the
Outbox Publisher sends messages to the `auction.events` topic exchange. Live
Feed and Operations own their consumer queues and bindings. Infrastructure
owns only the RabbitMQ process and does not own event semantics.
