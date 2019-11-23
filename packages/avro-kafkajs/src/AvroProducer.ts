import { SchemaRegistry } from './SchemaRegistry';
import { Producer, Logger, RecordMetadata, ProducerEvents, ValueOf } from 'kafkajs';
import { AvroProducerRecord, AvroProducerBatch } from './types';
import { AvroTransaction } from './AvroTransaction';
import { toProducerRecord, toProducerBatch } from './avro';

export class AvroProducer {
  constructor(public schemaRegistry: SchemaRegistry, public producer: Producer) {}

  public connect(): Promise<void> {
    return this.producer.connect();
  }

  public disconnect(): Promise<void> {
    return this.producer.disconnect();
  }

  public isIdempotent(): boolean {
    return this.producer.isIdempotent();
  }

  public async transaction(): Promise<AvroTransaction> {
    return new AvroTransaction(this.schemaRegistry, await this.producer.transaction());
  }

  public logger(): Logger {
    return this.producer.logger();
  }

  public async send<T = unknown>(record: AvroProducerRecord<T>): Promise<RecordMetadata[]> {
    return this.producer.send(await toProducerRecord(this.schemaRegistry, record));
  }

  public async sendBatch(batch: AvroProducerBatch): Promise<RecordMetadata[]> {
    return this.producer.sendBatch(await toProducerBatch(this.schemaRegistry, batch));
  }

  public on(eventName: ValueOf<ProducerEvents>, listener: (...args: any[]) => void): void {
    return this.producer.on(eventName, listener);
  }
}