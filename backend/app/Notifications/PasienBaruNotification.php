<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasienBaruNotification extends Notification
{
    use Queueable;

    protected $kunjungan;

    /**
     * Create a new notification instance.
     */
    public function __construct($kunjungan)
    {
        $this->kunjungan = $kunjungan;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'entity_id' => $this->kunjungan->id,
            'entity_type' => 'kunjungan',
            'title' => 'Pasien Baru',
            'message' => "Pasien {$this->kunjungan->pasien->nama} menunggu di {$this->kunjungan->poli}",
            'action_url' => "/kunjungan/{$this->kunjungan->id}",
        ];
    }
}
