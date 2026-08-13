# Import create_engine to establish a connection to the database
from sqlalchemy import create_engine
# Import MetaData to hold database schemas and naming conventions
from sqlalchemy import MetaData
# Import declarative_base to create a base class for ORM models
from sqlalchemy.orm import declarative_base
# Import sessionmaker to create a factory for new database sessions
from sqlalchemy.orm import sessionmaker
# Import our application settings to access the DATABASE_URL
from core.config import settings
# Import Generator for type hinting the get_db function
from typing import Generator

# Define naming conventions to ensure consistent database constraint names for Alembic migrations
naming_convention = {
    # Naming convention for indexes
    "ix": "ix_%(column_0_label)s",
    # Naming convention for unique constraints
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    # Naming convention for check constraints
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    # Naming convention for foreign keys
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    # Naming convention for primary keys
    "pk": "pk_%(table_name)s"
}

# Create a MetaData instance with our custom naming conventions
metadata = MetaData(naming_convention=naming_convention)

# Create the SQLAlchemy engine, passing the database URL
# We set check_same_thread to False for SQLite because FastAPI handles requests in multiple threads
engine = create_engine(
    # The database URL from our settings
    settings.DATABASE_URL, 
    # Connection arguments specifically required for SQLite in a multi-threaded environment
    connect_args={'check_same_thread': False}
)

# Create a sessionmaker factory for creating new Session objects
# autocommit=False ensures we manually control transactions for data integrity
# autoflush=False prevents automatic flushing of pending changes before queries
# bind=engine connects the sessions to our database engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the declarative base class for our models, using our custom metadata
Base = declarative_base(metadata=metadata)

# Define a dependency function to provide a database session per request
def get_db() -> Generator:
    # Create a new database session instance
    db = SessionLocal()
    # Use a try block to ensure the session is always closed
    try:
        # Yield the session to the FastAPI route handler
        yield db
    # Use a finally block to execute cleanup code regardless of exceptions
    finally:
        # Close the session to release database connections back to the pool
        db.close()
