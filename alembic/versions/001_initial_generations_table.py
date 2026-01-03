"""Initial migration for generations table.

Revision ID: 001_initial
Revises:
Create Date: 2026-01-03

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create generations table with indexes."""
    op.create_table(
        'generations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('generation_type', sa.String(), nullable=False),
        sa.Column('prompt', sa.String(), nullable=False),
        sa.Column('negative_prompt', sa.String(), nullable=True),
        sa.Column('parameters', sa.JSON(), nullable=False),
        sa.Column('output_path', sa.String(), nullable=False),
        sa.Column('output_url', sa.String(), nullable=True),
        sa.Column('width', sa.Integer(), nullable=True),
        sa.Column('height', sa.Integer(), nullable=True),
        sa.Column('steps', sa.Integer(), nullable=True),
        sa.Column('guidance_scale', sa.Float(), nullable=True),
        sa.Column('seed', sa.Integer(), nullable=True),
        sa.Column('model_name', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('error_message', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('processing_time', sa.Float(), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('favorite', sa.Boolean(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for common queries
    op.create_index('ix_generations_id', 'generations', ['id'])
    op.create_index('ix_generations_status', 'generations', ['status'])
    op.create_index('ix_generations_generation_type', 'generations', ['generation_type'])
    op.create_index('ix_generations_created_at', 'generations', ['created_at'])
    op.create_index('ix_generations_favorite', 'generations', ['favorite'])

    # Add GIN index for JSON parameters (PostgreSQL specific)
    op.execute('CREATE INDEX ix_generations_parameters_gin ON generations USING GIN (parameters)')


def downgrade() -> None:
    """Drop generations table."""
    op.drop_index('ix_generations_parameters_gin', table_name='generations')
    op.drop_index('ix_generations_favorite', table_name='generations')
    op.drop_index('ix_generations_created_at', table_name='generations')
    op.drop_index('ix_generations_generation_type', table_name='generations')
    op.drop_index('ix_generations_status', table_name='generations')
    op.drop_index('ix_generations_id', table_name='generations')
    op.drop_table('generations')
