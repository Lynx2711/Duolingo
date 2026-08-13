# Import standard libraries for logging and path manipulation
from logging.config import fileConfig
import sys
import os

# Import sqlalchemy tools for migrations
from sqlalchemy import engine_from_config
from sqlalchemy import pool

# Import Alembic context
from alembic import context

# Add backend directory to path so modules can be resolved correctly
# This ensures Alembic can find the 'core', 'models', and 'schemas' packages
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import database Base object containing metadata for all registered models
from core.database import Base

# Import all models to ensure they are registered with the Base's metadata
# This is crucial for Alembic's autogenerate feature to detect schema changes
from models.user import *
from models.course import *
from models.lesson import *
from models.progress import *

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the target metadata for Alembic to inspect
# It uses this metadata to compare against the actual database and generate migrations
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    # Grab the URL from alembic.ini
    url = config.get_main_option("sqlalchemy.url")
    # Configure context in offline mode, providing target metadata and naming convention
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        # Provide naming convention if any in Base.metadata
        render_as_batch=True # Helpful for SQLite migrations
    )

    # Execute migrations within a transaction
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    # Create the SQLAlchemy engine from Alembic config
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    # Open a connection to the database
    with connectable.connect() as connection:
        # Configure context for online migrations using the active connection
        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            render_as_batch=True # Needed for SQLite migrations which don't support some ALTER TABLE ops well
        )

        # Run the actual migrations inside a transaction block
        with context.begin_transaction():
            context.run_migrations()

# Standard Alembic logic to decide which mode to run based on arguments
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
