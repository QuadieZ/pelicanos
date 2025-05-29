from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.models import Variable
import sys
import os

# Add the project root to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
sys.path.append(project_root)

from packages.models.dataset.preprocess import import_data, preprocess_data

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

def check_new_data(**context):
    """Check if there's new sales data available"""
    try:
        path = import_data()
        print(f"Data path: {path}")
        return path
    except Exception as e:
        print(f"Error in check_new_data: {e}")
        raise

def run_preprocessing(**context):
    """Run the preprocessing pipeline"""
    try:
        path = context['task_instance'].xcom_pull(task_ids='check_new_data')
        print(f"Running preprocessing with path: {path}")
        preprocess_data(path)
    except Exception as e:
        print(f"Error in run_preprocessing: {e}")
        raise

with DAG(
    'pricing_pipeline',
    default_args=default_args,
    description='Pipeline for processing sales data and generating pricing insights',
    schedule_interval='0 0 * * *',  # Run daily at midnight
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['pricing', 'sales'],
) as dag:

    check_data = PythonOperator(
        task_id='check_new_data',
        python_callable=check_new_data,
    )

    preprocess = PythonOperator(
        task_id='run_preprocessing',
        python_callable=run_preprocessing,
    )

    # Set task dependencies
    check_data >> preprocess
