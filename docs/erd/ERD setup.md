# ERD SETUP

To recreate the ERD diagram the steps are mentioned below

![ERD diagram](<EcoVibe Physical ERD.png>)

## Steps to recreate the ERD diagram

1. Click [here](https://dbdiagram.io/home) to go to dbdiagram.io website and on the website click on ```Create your diagram``` button
2. On the left pane of your new diagram file paste the following code

    ```
    enum user_roles {
    client
    admin
    super_admin
    }

    enum user_account_status{
    active
    inactive
    suspended
    }

    Table users {
    id integer [primary key]
    industry varchar [not null]
    full_name varchar [not null]
    phone_number varchar [not null, unique]
    email varchar [not null, unique]
    role user_roles [not null]
    profile_image_url varchar
    password_hash varchar
    account_status user_account_status
    created_at date
    updated_at date
    }

    Table services {
    id integer [primary key]
    name varchar [not null]
    description varchar [not null]
    duration varchar [not null]
    price integer [not null, note: "CHECK (amount > 0)"]
    created_at date [not null]
    updated_at date
    admin_id integer [not null, note: "CHECK (users.role = 'admin')"]
    currency varchar [not null, default: "KES"]
    }

    enum bookings_status{
    pending
    confirmed
    cancelled
    }

    Table bookings {
    id integer [primary key]
    booking_date date [not null, note: "Can't book in the past ie can only book today or in the future"]
    start_time datetime [not null]
    end_time datetime [not null]
    status bookings_status [default: "pending"]
    client_id integer [not null, note: "CHECK (users.role = 'client')"]
    service_id integer [not null]
    created_at date [not null]
    updated_at date
    }

    enum payments_method{
    mpesa
    }

    Table payments {
    id integer [primary key]
    invoice_id integer [not null]
    payment_method payments_method [default: "Mpesa"]
    payment_method_id integer [not null]
    created_at date [not null]
    }

    Table mpesa_transactions {
    id integer [primary key]
    amount integer [not null, note: "CHECK (amount > 0)"]
    payment_date date [not null]
    transaction_code varchar [not null]
    paid_by varchar [not null]
    created_at date [not null]
    }

    Table documents {
    id integer [primary key]
    admin_id integer [not null, note: "CHECK (users.role = 'admin')"]
    description varchar [not null]
    file_path varchar [not null]
    created_at date [not null]
    }

    enum tickets_status{
    open
    closed
    in_progress
    }

    Table tickets {
    id integer [primary key]
    client_id integer [not null, note: "CHECK (users.role = 'client')"]
    assigned_admin_id integer [ note: "CHECK (users.role = 'admin')"]
    subject varchar [not null]
    status tickets_status [not null, default: "open"]
    created_at datetime [not null]
    }

    Table ticket_messages {
    id integer [primary key]
    ticket_id integer [not null]
    sender_id integer [not null]
    body varchar [not null]
    created_at datetime [not null]
    }

    Table newsletters_subscribers {
    id integer [primary key]
    email varchar [not null, unique]
    subscription_date date [not null]
    }

    enum invoices_status {
    paid
    pending
    overdue
    }

    Table invoices {
    id integer [primary key]
    amount integer [not null, note: "CHECK (amount > 0)"]
    // currency varchar
    client_id integer [not null, note: "CHECK (users.role = 'client')"]
    service_id integer [not null]
    created_at date [not null]
    due_date date [not null]
    status invoices_status [default: "pending"]
    }

    enum blog_type {
    blog
    newsletter
    }

    Table blogs {
    id integer [primary key]
    date_created date [not null]
    date_updated date 
    title varchar [not null]
    likes integer [default: 0]
    views integer [default: 0]
    image varchar [not null]
    category varchar [not null]
    author_name varchar [not null]
    admin_id integer [not null, note: "CHECK (users.role = 'admin')"]
    content text [not null]
    reading_duration varchar [not null]
    type blog_type [not null]
    }

    Table comments {
    id integer [primary key]
    description varchar [not null]
    client_id integer [not null, note: "CHECK (users.role = 'client')"]
    blog_id integer [not null]
    created_at date [not null]
    updated_at date
    }

    Table tokens {
    id integer [primary key]
    user_id integer [not null]
    created_at date [not null]
    value varchar
    expiry_time datetime
    }

    Ref: "users"."id" < "services"."admin_id"

    Ref: "users"."id" < "bookings"."client_id"

    Ref: "services"."id" < "bookings"."service_id"

    Ref: "invoices"."id" < "payments"."invoice_id"

    Ref: "users"."id" < "blogs"."admin_id"

    Ref: "comments"."client_id" > "users"."id"

    Ref: "users"."id" < "documents"."admin_id"

    Ref: "services"."id" < "invoices"."service_id" 

    Ref: "payments"."payment_method_id" - "mpesa_transactions"."id"

    Ref: "users"."id" < "tokens"."user_id"

    Ref: "tickets"."id" < "ticket_messages"."ticket_id"

    Ref: "users"."id" < "tickets"."client_id"

    Ref: "users"."id" < "tickets"."assigned_admin_id"

    Ref: "users"."id" < "ticket_messages"."sender_id"

    Ref: "comments"."blog_id" > "blogs"."id"

    Ref: "users"."id" < "invoices"."client_id"
    ```