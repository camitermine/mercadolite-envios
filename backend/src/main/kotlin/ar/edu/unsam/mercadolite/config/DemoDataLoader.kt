package ar.edu.unsam.mercadolite.config

import ar.edu.unsam.mercadolite.repository.ShipmentRepository
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

// Solo con el perfil "demo": carga órdenes y envíos de ejemplo para mostrar la app sin tener que crearlos a mano.
// Sin el perfil, el backend arranca únicamente con los transportistas.
@Component
@Profile("demo")
class DemoDataLoader(
    private val shipmentRepository: ShipmentRepository,
) : ApplicationRunner {
    override fun run(args: ApplicationArguments) {
        shipmentRepository.reset()
    }
}
